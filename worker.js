/**
 * Cloudflare Worker for T-Mobble Global Leaderboard
 * 
 * This worker provides a simple REST API for storing and retrieving high scores.
 * Uses Cloudflare KV for persistent storage (100k reads/day, 1k writes/day free).
 * 
 * Endpoints:
 * - GET /scores - Get top 100 scores
 * - POST /scores - Submit a new score
 * 
 * Security Features:
 * - Rate limiting (per IP)
 * - Input validation and sanitization
 * - Content filtering for usernames
 * - Request size limiting
 * - Score validation (prevents unrealistic scores)
 * - Configurable CORS origins
 */

import Filter from 'bad-words';

const filter = new Filter();

const LEADERBOARD_KEY = 'global-leaderboard';
const MAX_SCORES = 100;
const MAX_NAME_LENGTH = 20;
const MAX_REASONABLE_SCORE = 99999999999999;
const MAX_REQUEST_BODY_SIZE = 1024; // 1KB max request size
const RATE_LIMIT_KEY_PREFIX = 'ratelimit:';
const MAX_REQUESTS_PER_MINUTE = 10; // Max score submissions per minute per IP
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Configurable allowed origins (set to ['*'] to allow all)
const ALLOWED_ORIGINS = ['*']; // Change to specific domains in production: ['https://your-domain.com']

// Patterns to block in usernames (URLs, spam patterns)
const BANNED_USERNAME_PATTERNS = [
  /http[s]?:\/\//i,     // URLs
  /www\./i,              // Website references
  /admin/i,              // Impersonation attempts
  /(.)\1{4,}/,           // Excessive character repetition (aaaaa)
  /[^\x20-\x7E]/,        // Non-printable or special Unicode characters
];

// Only allow alphanumeric, spaces, and common punctuation
const VALID_USERNAME_PATTERN = /^[a-zA-Z0-9\s\-_.'!]+$/;

/**
 * Get CORS headers with origin validation
 */
function getCorsHeaders(request) {
  const requestOrigin = request.headers.get('Origin');
  let allowedOrigin = '*';

  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes('*')) {
    if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else {
      allowedOrigin = ALLOWED_ORIGINS[0];
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

/**
 * Rate limiting check using KV store
 */
async function checkRateLimit(request, env) {
  const clientIp = request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';

  const rateLimitKey = `${RATE_LIMIT_KEY_PREFIX}${clientIp}`;
  const currentCount = parseInt(await env.LEADERBOARD.get(rateLimitKey) || '0', 10);

  if (currentCount >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter with TTL
  await env.LEADERBOARD.put(
    rateLimitKey,
    String(currentCount + 1),
    { expirationTtl: RATE_LIMIT_WINDOW_SECONDS }
  );

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_MINUTE - currentCount - 1
  };
}

/**
 * Validate username content
 */
function validateUsername(name) {
  // Check for profanity using bad-words library
  if (filter.isProfane(name)) {
    return { valid: false, reason: 'Username contains prohibited content' };
  }

  // Check against banned patterns
  for (const pattern of BANNED_USERNAME_PATTERNS) {
    if (pattern.test(name)) {
      return { valid: false, reason: 'Username contains prohibited content' };
    }
  }

  // Check if contains only valid characters
  if (!VALID_USERNAME_PATTERN.test(name)) {
    return { valid: false, reason: 'Username contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate score is realistic
 */
function validateScore(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return { valid: false, reason: 'Score must be a valid number' };
  }

  if (score < 0) {
    return { valid: false, reason: 'Score cannot be negative' };
  }

  if (score > MAX_REASONABLE_SCORE) {
    return { valid: false, reason: `Score exceeds maximum allowed value (${MAX_REASONABLE_SCORE})` };
  }

  if (!Number.isInteger(score)) {
    return { valid: false, reason: 'Score must be an integer' };
  }

  return { valid: true };
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // GET /scores - Retrieve leaderboard
    if (request.method === 'GET' && url.pathname === '/scores') {
      try {
        const leaderboard = await env.LEADERBOARD.get(LEADERBOARD_KEY, 'json') || [];

        return new Response(JSON.stringify({
          success: true,
          scores: leaderboard,
          count: leaderboard.length
        }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to retrieve scores'
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // POST /scores - Submit new score
    if (request.method === 'POST' && url.pathname === '/scores') {
      try {
        // Check rate limit first
        const rateLimitCheck = await checkRateLimit(request, env);
        if (!rateLimitCheck.allowed) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Rate limit exceeded. Please wait before submitting another score.',
            retryAfter: RATE_LIMIT_WINDOW_SECONDS
          }), {
            status: 429,
            headers: {
              ...corsHeaders,
              'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS)
            }
          });
        }

        // Check request body size
        const contentLength = request.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_BODY_SIZE) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Request body too large'
          }), {
            status: 413,
            headers: corsHeaders
          });
        }

        // Parse request body with size check
        const bodyText = await request.text();
        if (bodyText.length > MAX_REQUEST_BODY_SIZE) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Request body too large'
          }), {
            status: 413,
            headers: corsHeaders
          });
        }

        let body;
        try {
          body = JSON.parse(bodyText);
        } catch (e) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Invalid JSON in request body'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const { name, score } = body;

        // Validate name exists and is a string
        if (!name || typeof name !== 'string') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Name is required and must be a string'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Sanitize and validate name length
        const sanitizedName = name.trim().substring(0, MAX_NAME_LENGTH);

        if (sanitizedName.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Name cannot be empty'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        if (sanitizedName.length < 2) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Name must be at least 2 characters'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Validate username content
        const usernameValidation = validateUsername(sanitizedName);
        if (!usernameValidation.valid) {
          return new Response(JSON.stringify({
            success: false,
            error: usernameValidation.reason
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Validate score
        const scoreValidation = validateScore(score);
        if (!scoreValidation.valid) {
          return new Response(JSON.stringify({
            success: false,
            error: scoreValidation.reason
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Get current leaderboard
        let leaderboard = await env.LEADERBOARD.get(LEADERBOARD_KEY, 'json') || [];

        // Ensure leaderboard is an array
        if (!Array.isArray(leaderboard)) {
          leaderboard = [];
        }

        // Add new score (score is already validated as integer)
        const newEntry = {
          name: sanitizedName,
          score: score,
          timestamp: Date.now(),
          date: new Date().toISOString()
        };

        leaderboard.push(newEntry);

        // Sort by score (descending) and keep top MAX_SCORES
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, MAX_SCORES);

        // Save to KV
        await env.LEADERBOARD.put(LEADERBOARD_KEY, JSON.stringify(leaderboard));

        // Determine rank
        const rank = leaderboard.findIndex(entry =>
          entry.timestamp === newEntry.timestamp
        ) + 1;

        return new Response(JSON.stringify({
          success: true,
          rank: rank,
          total: leaderboard.length,
          score: newEntry
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        // Log error for debugging but don't expose internal details
        console.error('Error processing score submission:', error);

        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to save score. Please try again.'
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({
      success: false,
      error: 'Not found'
    }), {
      status: 404,
      headers: corsHeaders
    });
  }
};
