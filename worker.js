/**
 * Cloudflare Worker for T-Mobble Global Leaderboard
 * 
 * This worker provides a simple REST API for storing and retrieving high scores.
 * Uses Cloudflare KV for persistent storage (100k reads/day, 1k writes/day free).
 * 
 * Endpoints:
 * - GET /scores - Get top 100 scores
 * - POST /scores - Submit a new score
 */

const LEADERBOARD_KEY = 'global-leaderboard';
const MAX_SCORES = 100;
const MAX_NAME_LENGTH = 20;

export default {
  async fetch(request, env) {
    // CORS headers for PWA access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

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
        const body = await request.json();
        const { name, score } = body;

        // Validation
        if (!name || typeof name !== 'string') {
          return new Response(JSON.stringify({
            success: false,
            error: 'Name is required and must be a string'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        if (!score || typeof score !== 'number' || score < 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Score must be a positive number'
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Sanitize name
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

        // Get current leaderboard
        let leaderboard = await env.LEADERBOARD.get(LEADERBOARD_KEY, 'json') || [];

        // Add new score
        const newEntry = {
          name: sanitizedName,
          score: Math.floor(score),
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
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to save score: ' + error.message
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
