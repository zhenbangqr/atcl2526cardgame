document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const submitUsernameButton = document.getElementById('submit-username');
    // const clearLeaderboardButton = document.getElementById('clear-leaderboard');
    const leaderboardBody = document.getElementById('leaderboard-body');
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Format time from seconds to MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update leaderboard display
    function updateLeaderboard() {
        leaderboardBody.innerHTML = '';
        const sortedLeaderboard = [...leaderboard].sort((a, b) => a.time - b.time);
        
        sortedLeaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${formatTime(entry.time)}</td>
                <td>${entry.attempts}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // Clear leaderboard and previous player data
    /*
    function clearLeaderboard() {
        if (confirm('确定要清除所有记录吗？(Are you sure you want to clear all records?)')) {
            localStorage.removeItem('leaderboard');
            localStorage.removeItem('currentPlayer');
            leaderboard = [];
            updateLeaderboard();
            alert('记录已清除 (Records have been cleared)');
        }
    }
    */

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

    // Clear leaderboard button handler
    // clearLeaderboardButton.addEventListener('click', clearLeaderboard);

    // Initialize leaderboard on page load
    updateLeaderboard();
}); 