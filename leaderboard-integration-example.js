/**
 * Example implementation for integrating global leaderboard UI
 * This is a reference implementation - customize as needed
 */

// After game creation in main.js, configure leaderboard API:
// game.scoreManager.setLeaderboardApi('https://t-mobble-leaderboard.YOUR-SUBDOMAIN.workers.dev');

// Example: Show name input dialog after new high score
function promptForLeaderboardSubmission(game) {
  const currentScore = game.scoreManager.getCurrentScore();
  const highScore = game.scoreManager.highScore;

  if (currentScore === highScore && currentScore > 0) {
    const name = prompt('New high score! Enter your name for the global leaderboard:', game.scoreManager.playerName);

    if (name && name.trim()) {
      submitToGlobalLeaderboard(game, name.trim());
    }
  }
}

// Example: Submit score to global leaderboard
async function submitToGlobalLeaderboard(game, playerName) {
  try {
    const result = await game.scoreManager.submitToLeaderboard(playerName);

    if (result.success) {
      alert(`Score submitted! You rank #${result.rank} out of ${result.total} players!`);
    } else {
      console.error('Failed to submit score:', result.error);
    }
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
  }
}

// Example: Fetch and display global leaderboard
async function displayGlobalLeaderboard(game) {
  const leaderboardDiv = document.getElementById('leaderboard');
  if (!leaderboardDiv) return;

  try {
    const data = await game.scoreManager.fetchLeaderboard();

    if (data.success && data.scores.length > 0) {
      let html = '<h2>Global Leaderboard</h2><ol>';

      data.scores.slice(0, 50).forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        html += `<li><strong>${entry.name}</strong> - ${entry.score} <small>(${date})</small></li>`;
      });

      html += '</ol>';
      leaderboardDiv.innerHTML = html;
    } else {
      leaderboardDiv.innerHTML = '<p>No scores yet. Be the first!</p>';
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    leaderboardDiv.innerHTML = '<p>Failed to load leaderboard</p>';
  }
}

// Example: Add leaderboard button to HTML
/*
<button id="viewLeaderboardBtn" onclick="displayGlobalLeaderboard(game)">
  View Global Leaderboard
</button>
<div id="leaderboard"></div>
*/

// Example: Hook into game over event
// In Game.js, after setting gameOver = true:
/*
if (this.scoreManager.updateHighScore()) {
  this.updateScoreDisplay();
  // Optionally prompt for leaderboard submission
  promptForLeaderboardSubmission(this);
}
*/
