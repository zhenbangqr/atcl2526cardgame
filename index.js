document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const submitUsernameButton = document.getElementById('submit-username');
    const leaderboardBody = document.getElementById('leaderboard-body');
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Update leaderboard display
    function updateLeaderboard() {
        leaderboardBody.innerHTML = '';
        const sortedLeaderboard = [...leaderboard].sort((a, b) => a.attempts - b.attempts);
        
        sortedLeaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${entry.difficulty}</td>
                <td>${entry.attempts}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // Check if player has already played
    function hasPlayerPlayed(username) {
        return leaderboard.some(entry => entry.username.toLowerCase() === username.toLowerCase());
    }

    // Username submission handler
    submitUsernameButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            if (hasPlayerPlayed(username)) {
                alert('你已经玩过游戏了 (You have already played the game)');
                return;
            }
            // Store username in localStorage and redirect to game page
            localStorage.setItem('currentPlayer', username);
            window.location.href = 'game.html';
        } else {
            alert('请输入你的名字 (Please enter your name)');
        }
    });

    // Initialize leaderboard on page load
    updateLeaderboard();
}); 