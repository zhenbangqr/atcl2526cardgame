document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty');
    const startGameButton = document.getElementById('startGame');
    const matchesFoundDisplay = document.getElementById('matches-found');
    const attemptsDisplay = document.getElementById('attempts');
    const currentPlayerDisplay = document.getElementById('current-player');
    const completionMessage = document.getElementById('completion-message');

    // Get current player from localStorage
    const currentPlayer = localStorage.getItem('currentPlayer');
    if (!currentPlayer) {
        window.location.href = 'index.html';
        return;
    }
    currentPlayerDisplay.textContent = currentPlayer;

    // Define all available card types related to Peer Support
    const allCardTypes = [
        { id: 'listen', keyword: '倾听', image: '耳朵图案', order: 1 },
        { id: 'understand', keyword: '理解', image: '心形图案', order: 2 },
        { id: 'support', keyword: '支持', image: '握手图案', order: 3 },
        { id: 'hope', keyword: '希望', image: '灯泡图案', order: 4 },
        { id: 'growth', keyword: '成长', image: '树苗图案', order: 5 }
    ];

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let attempts = 0;

    startGameButton.addEventListener('click', initializeGame);

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
        matchesFoundDisplay.textContent = '0';
        attemptsDisplay.textContent = '0';
        gameBoard.innerHTML = '';
        completionMessage.style.display = 'none';
    }

    function createCardsForGame() {
        const gameCardTypes = allCardTypes
            .filter(card => card.order !== null)
            .sort((a, b) => a.order - b.order)
            .slice(0, totalPairs);

        gameCardTypes.forEach(type => {
            cards.push({ ...type, uniqueId: type.id + '1', isFlipped: false, isMatched: false });
            cards.push({ ...type, uniqueId: type.id + '2', isFlipped: false, isMatched: false });
        });
    }

    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        cards.forEach(cardData => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.id = cardData.id;
            cardElement.dataset.uniqueId = cardData.uniqueId;

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
            return;
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

        if (card1.data.id === card2.data.id) {
            card1.data.isMatched = true;
            card2.data.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');

            matchedPairs++;
            matchesFoundDisplay.textContent = matchedPairs;

            setTimeout(() => {
                alert("Describe to our member");
            }, 400);

            flippedCards = [];

            if (matchedPairs === totalPairs) {
                setTimeout(completeGame, 1000);
            }
        } else {
            setTimeout(() => {
                card1.data.isFlipped = false;
                card2.data.isFlipped = false;
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    function completeGame() {
        gameBoard.style.display = 'none';
        completionMessage.style.display = 'block';
        
        // Save score and return to index
        const score = {
            username: currentPlayer,
            difficulty: difficultySelect.value,
            attempts: attempts,
            date: new Date().toISOString()
        };
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push(score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        
        alert('恭喜完成游戏！(Congratulations on completing the game!)');
        window.location.href = 'index.html';
    }
}); 