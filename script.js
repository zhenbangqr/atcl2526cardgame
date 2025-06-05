document.addEventListener('DOMContentLoaded', () => {
    const usernameSection = document.getElementById('username-section');
    const gameSection = document.getElementById('game-section');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const usernameInput = document.getElementById('username');
    const submitUsernameButton = document.getElementById('submit-username');
    const currentPlayerDisplay = document.getElementById('current-player');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const returnToStartButton = document.getElementById('return-to-start');

    const gameBoard = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty');
    const startGameButton = document.getElementById('startGame');
    const matchesFoundDisplay = document.getElementById('matches-found');
    const attemptsDisplay = document.getElementById('attempts');

    const sequencingSection = document.getElementById('sequencing-section');
    const matchedKeywordsDisplay = document.getElementById('matched-keywords-display');
    const sequenceInput = document.getElementById('sequence-input');
    const submitSequenceButton = document.getElementById('submit-sequence');
    const sequenceFeedback = document.getElementById('sequence-feedback');
    const completionMessage = document.getElementById('completion-message');

    let currentUsername = '';
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
            currentUsername = username;
            currentPlayerDisplay.textContent = username;
            usernameSection.style.display = 'none';
            gameSection.style.display = 'block';
            leaderboardSection.style.display = 'block';
            initializeGame();
        } else {
            alert('请输入你的名字 (Please enter your name)');
        }
    });

    // Return to start button handler
    returnToStartButton.addEventListener('click', () => {
        gameSection.style.display = 'none';
        usernameSection.style.display = 'block';
        usernameInput.value = '';
        updateLeaderboard();
    });

    // Save score to leaderboard
    function saveScore() {
        const score = {
            username: currentUsername,
            difficulty: difficultySelect.value,
            attempts: attempts,
            date: new Date().toISOString()
        };
        leaderboard.push(score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        updateLeaderboard();
    }

    // Define all available card types related to Peer Support
    // 'order' is for the sequencing part
    const allCardTypes = [
        { id: 'listen', keyword: '倾听', image: '耳朵图案', order: 1 }, // Ear
        { id: 'understand', keyword: '理解', image: '心形图案', order: 2 }, // Heart
        { id: 'support', keyword: '支持', image: '握手图案', order: 3 }, // Handshake
        { id: 'hope', keyword: '希望', image: '灯泡图案', order: 4 }, // Lightbulb
        { id: 'growth', keyword: '成长', image: '树苗图案', order: 5 }  // Sprout
        // You can add '困惑' (Confusion) if needed, and decide if it's part of the sequence.
        // { id: 'confusion', keyword: '困惑', image: '问号图案', order: null }
    ];

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let attempts = 0;
    let currentMatchedKeywords = [];
    let currentCorrectSequence = [];

    startGameButton.addEventListener('click', initializeGame);
    submitSequenceButton.addEventListener('click', checkSequence);

    function initializeGame() {
        resetGameState();
        const difficulty = difficultySelect.value;
        switch (difficulty) {
            case 'easy': totalPairs = 2; break;
            case 'medium': totalPairs = 3; break;
            case 'hard': totalPairs = 4; break;
            case 'expert': totalPairs = 5; break;
            default: totalPairs = 2;
        }

        // Adjust grid columns based on number of pairs
        if (totalPairs <= 2) {
            gameBoard.className = 'game-board cols-2';
        } else if (totalPairs === 3) {
            gameBoard.className = 'game-board cols-3';
        } else if (totalPairs === 4) {
            gameBoard.className = 'game-board cols-4';
        } else {
            gameBoard.className = 'game-board cols-5';
        }

        createCardsForGame();
        shuffleCards();
        renderBoard();
    }

    function resetGameState() {
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        attempts = 0;
        currentMatchedKeywords = [];
        currentCorrectSequence = [];
        matchesFoundDisplay.textContent = '0';
        attemptsDisplay.textContent = '0';
        gameBoard.innerHTML = ''; // Clear previous cards
        sequencingSection.style.display = 'none';
        completionMessage.style.display = 'none';
        sequenceFeedback.textContent = '';
        sequenceInput.value = '';
    }

    function createCardsForGame() {
        // Select a subset of card types based on totalPairs, sorted by their intended order
        const gameCardTypes = allCardTypes
            .filter(card => card.order !== null) // Only pick cards that are part of the sequence
            .sort((a, b) => a.order - b.order)
            .slice(0, totalPairs);

        gameCardTypes.forEach(type => {
            // Each type creates two cards for a pair
            cards.push({ ...type, uniqueId: type.id + '1', isFlipped: false, isMatched: false });
            cards.push({ ...type, uniqueId: type.id + '2', isFlipped: false, isMatched: false });
        });

        // Store the keywords and the correct sequence for the current game
        currentMatchedKeywords = gameCardTypes.map(card => card.keyword); // Will be displayed later
        currentCorrectSequence = gameCardTypes.map(card => card.keyword); // Already in order
    }

    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]]; // Swap elements
        }
    }

    function renderBoard() {
        gameBoard.innerHTML = ''; // Clear previous board
        cards.forEach(cardData => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.id = cardData.id; // The type id (e.g., 'listen')
            cardElement.dataset.uniqueId = cardData.uniqueId; // The unique id (e.g., 'listen1')

            // Content of the card (image placeholder and keyword)
            const contentElement = document.createElement('div');
            contentElement.classList.add('card-content');
            contentElement.innerHTML = `
                <div class="image-placeholder">${cardData.image}</div>
                <div>${cardData.keyword}</div>
            `;
            cardElement.appendChild(contentElement);

            if (cardData.isFlipped) {
                cardElement.classList.add('flipped');
            }
            if (cardData.isMatched) {
                cardElement.classList.add('matched');
            }

            cardElement.addEventListener('click', () => flipCard(cardElement, cardData));
            gameBoard.appendChild(cardElement);
        });
    }

    function flipCard(cardElement, cardData) {
        if (cardData.isMatched || cardData.isFlipped || flippedCards.length === 2) {
            return; // Can't flip matched, already flipped, or if 2 cards are already up
        }

        cardData.isFlipped = true;
        cardElement.classList.add('flipped');
        flippedCards.push({ element: cardElement, data: cardData });

        if (flippedCards.length === 2) {
            attempts++;
            attemptsDisplay.textContent = attempts;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.data.id === card2.data.id) { // It's a match!
            card1.data.isMatched = true;
            card2.data.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');

            matchedPairs++;
            matchesFoundDisplay.textContent = matchedPairs;

            // Show success message
            setTimeout(() => {
                alert("Describe to our member");
            }, 400);

            flippedCards = []; // Reset for next turn

            if (matchedPairs === totalPairs) {
                setTimeout(showSequencingTask, 1000); // All pairs found, move to sequencing
            }
        } else { // Not a match
            // Flip them back after a short delay
            setTimeout(() => {
                card1.data.isFlipped = false;
                card2.data.isFlipped = false;
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    function showSequencingTask() {
        gameBoard.style.display = 'none'; // Hide game board
        gameInfo.style.display = 'none'; // Hide game info
        sequencingSection.style.display = 'block';
        // Display the keywords that were matched, in a random (or original shuffled) order if desired,
        // or simply list them. For simplicity, we'll just list them as they were defined for the level.
        // The player needs to remember their meaning and the flow.
        matchedKeywordsDisplay.textContent = `关键词 (Keywords): ${currentMatchedKeywords.join(', ')}`;
        sequenceFeedback.textContent = '';
    }

    function checkSequence() {
        const userAnswer = sequenceInput.value.trim().split(',').map(s => s.trim());
        const correctAnswerString = currentCorrectSequence.join(',');
        const userAnswerString = userAnswer.join(',');

        if (userAnswerString.toLowerCase() === correctAnswerString.toLowerCase()) {
            sequenceFeedback.textContent = '顺序正确！太棒了！(Correct sequence! Well done!)';
            sequenceFeedback.style.color = 'green';
            sequencingSection.style.display = 'none';
            completionMessage.style.display = 'block';
            saveScore(); // Save score when game is completed
            
            // Show completion alert and return to start screen after clicking OK
            alert('恭喜完成游戏！(Congratulations on completing the game!)');
            gameSection.style.display = 'none';
            usernameSection.style.display = 'block';
            usernameInput.value = '';
            updateLeaderboard();
        } else {
            sequenceFeedback.textContent = `顺序不正确 (Incorrect sequence). 正确顺序是 (The correct order is): ${correctAnswerString}. 请再试一次 (Try again) or restart.`;
            sequenceFeedback.style.color = 'red';
        }
    }

    // Initialize leaderboard on page load
    updateLeaderboard();
});