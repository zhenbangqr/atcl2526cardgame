document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const matchesFoundDisplay = document.getElementById('matches-found');
    const attemptsDisplay = document.getElementById('attempts');
    const currentPlayerDisplay = document.getElementById('current-player');
    const completionMessage = document.getElementById('completion-message');
    const timerDisplay = document.getElementById('timer');
    const returnHomeButton = document.getElementById('return-home');

    // Get current player from localStorage
    const currentPlayer = localStorage.getItem('currentPlayer');
    if (!currentPlayer) {
        window.location.href = 'index.html';
        return;
    }
    currentPlayerDisplay.textContent = currentPlayer;

    // Return home button handler
    returnHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Define all available card types related to Peer Support
    const allCardTypes = [
        { id: 'listen', keyword: '倾听', image: 'images/2.png', order: 1 },
        { id: 'understand', keyword: '理解', image: 'images/4.png', order: 2 },
        { id: 'support', keyword: '支持', image: 'images/6.png', order: 3 },
        { id: 'hope', keyword: '希望', image: 'images/8.png', order: 4 },
        { id: 'empathy', keyword: '共情', image: 'images/10.png', order: 5 },
        { id: 'respect', keyword: '尊重', image: 'images/12.png', order: 6 },
        { id: 'trust', keyword: '信任', image: 'images/14.png', order: 7 },
        { id: 'growth', keyword: '成长', image: 'images/16.png', order: 8 }
    ];

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 8; // Use all 8 cards (16 cards total)
    let attempts = 0;
    let startTime = null;
    let timerInterval = null;

    // Start the game immediately
    initializeGame();

    function initializeGame() {
        resetGameState();
        gameBoard.className = 'game-board cols-8 rows-2'; // 2x8 grid
        createCardsForGame();
        shuffleCards();
        renderBoard();
        startTimer();
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
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        startTime = null;
        timerDisplay.textContent = '00:00';
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function getElapsedTime() {
        return Math.floor((Date.now() - startTime) / 1000);
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
                <img src="${cardData.image}" alt="${cardData.keyword}">
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

            // Trigger confetti effect
            const card1Rect = card1.element.getBoundingClientRect();
            const card2Rect = card2.element.getBoundingClientRect();
            
            // Calculate center points of both cards
            const x1 = card1Rect.left + card1Rect.width / 2;
            const y1 = card1Rect.top + card1Rect.height / 2;
            const x2 = card2Rect.left + card2Rect.width / 2;
            const y2 = card2Rect.top + card2Rect.height / 2;

            // Create confetti from both card positions
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { x: x1 / window.innerWidth, y: y1 / window.innerHeight },
                colors: ['#4CAF50', '#45a049', '#2E7D32']
            });
            
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { x: x2 / window.innerWidth, y: y2 / window.innerHeight },
                colors: ['#4CAF50', '#45a049', '#2E7D32']
            });

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
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        gameBoard.style.display = 'none';
        completionMessage.style.display = 'block';
        
        // Multiple rainbow confetti bursts for game completion
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        
        // Center burst
        confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.6 },
            colors: colors,
            gravity: 1.2,
            scalar: 1.2
        });

        // Left burst
        confetti({
            particleCount: 100,
            spread: 120,
            origin: { x: 0.2, y: 0.6 },
            colors: colors,
            gravity: 1.2,
            scalar: 1.2
        });

        // Right burst
        confetti({
            particleCount: 100,
            spread: 120,
            origin: { x: 0.8, y: 0.6 },
            colors: colors,
            gravity: 1.2,
            scalar: 1.2
        });

        // Delayed bursts for more dramatic effect
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 0.4 },
                colors: colors,
                gravity: 1.2,
                scalar: 1.2
            });
        }, 250);

        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 0.8 },
                colors: colors,
                gravity: 1.2,
                scalar: 1.2
            });
        }, 500);
        
        // Save score
        const score = {
            username: currentPlayer,
            time: getElapsedTime(),
            attempts: attempts,
            date: new Date().toISOString()
        };
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push(score);
        // Sort leaderboard by time (ascending)
        leaderboard.sort((a, b) => a.time - b.time);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
}); 