document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        boardContainer: document.querySelector('.board-container'),
        board: document.querySelector('.board'),
        moves: document.querySelector('.moves'),
        timer: document.querySelector('.timer'),
        start: document.querySelector('button'),
        win: document.querySelector('.win'),
        input: document.querySelector('#player-name'),
        saveButton: document.querySelector('#save-leaderboard'),
        leaderboardList: document.querySelector('#leaderboard-list'),
        leaderboardSection: document.querySelector('.leaderboard-section')
    };

    let startbutton = document.getElementById('startBtn');

    const state = {
        gameStarted: false,
        flippedCards: 0,
        totalFlips: 0,
        totalTime: 0,
        loop: null,
        maxMoves: 20 // Example maxMoves value; adjust as needed
    };

    const shuffle = array => {
        const clonedArray = [...array];
        for (let i = clonedArray.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [clonedArray[i], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[i]];
        }
        return clonedArray;
    };

    const pickRandom = (array, items) => {
        const clonedArray = [...array];
        const randomPicks = [];
        for (let i = 0; i < items; i++) {
            const randomIndex = Math.floor(Math.random() * clonedArray.length);
            randomPicks.push(clonedArray[randomIndex]);
            clonedArray.splice(randomIndex, 1);
        }
        return randomPicks;
    };

    const generateGame = () => {
        const dimensions = selectors.board.getAttribute('data-dimension');
        if (dimensions % 2 !== 0) {
            throw new Error("The dimension of the board must be an even number.");
        }

        const images = [
            'pics/Card-Images/chose.png',
            'pics/Card-Images/doge.png',
            'pics/Card-Images/fire.png',
            'pics/Card-Images/look.png',
            'pics/Card-Images/pepe.png',
            'pics/Card-Images/pika.png',
            'pics/Card-Images/sponge.png',
            'pics/Card-Images/think.png',
            'pics/Card-Images/leo.png',
            'pics/Card-Images/winnie.png'
        ];

        const picks = pickRandom(images, (dimensions * dimensions) / 2);
        const items = shuffle([...picks, ...picks]);

        const cards = `
            <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
                ${items.map(item => `
                    <div class="card">
                        <div class="card-front"></div>
                        <div class="card-back"><img src="${item}" alt="Card image" style="width: 100%; height: 100%;"></div>
                    </div>
                `).join('')}
            </div>
        `;
        const parser = new DOMParser().parseFromString(cards, 'text/html');
        selectors.board.replaceWith(parser.querySelector('.board'));
    };

    const startGame = () => {
        startbutton.style.display = 'none';
        console.log('Starting the game'); // Debug line
        state.gameStarted = true;
        selectors.start.classList.add('disabled');
        state.loop = setInterval(() => {
            state.totalTime++;
            selectors.moves.innerText = `${state.totalFlips} moves`;
            selectors.timer.innerText = `Time: ${state.totalTime} sec`;
        }, 1000);
    };

    const flipBackCards = () => {
        document.querySelectorAll('.card:not(.matched)').forEach(card => {
            card.classList.remove('flipped');
        });
        state.flippedCards = 0;
    };

    const flipCard = (card) => {
        if (!state.gameStarted) {
            startGame();
        }
    
        if (!card.classList.contains('flipped') && state.flippedCards < 2) {
            card.classList.add('flipped');
            state.flippedCards++;
    
            if (state.flippedCards === 2) {
                state.totalFlips++; // Increment moves for each pair of flipped cards
                const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
                const firstCardSrc = flippedCards[0].querySelector('.card-back img').src;
                const secondCardSrc = flippedCards[1].querySelector('.card-back img').src;
    
                if (firstCardSrc === secondCardSrc) {
                    flippedCards[0].classList.add('matched');
                    flippedCards[1].classList.add('matched');
                    state.flippedCards = 0;
                } else {
                    setTimeout(() => {
                        flipBackCards();
                    }, 1000);
                }
    
                selectors.moves.innerText = `${state.totalFlips} moves`;
    
                if (state.totalFlips >= state.maxMoves && document.querySelectorAll('.card.matched').length !== document.querySelectorAll('.card').length) {
                    setTimeout(() => {
                        selectors.boardContainer.classList.add('flipped');
                        selectors.win.innerHTML = `
                            <span class="win-text">
                                Game Over!<br />
                                You reached the maximum of <span class="highlight">${state.maxMoves}</span> moves.
                            </span>
                        `;
                        clearInterval(state.loop);
                        selectors.start.innerText = 'Retry';
                        selectors.start.classList.remove('disabled');
                    }, 1000);
                }
            }
        }
    
        if (!document.querySelectorAll('.card:not(.matched)').length) {
            endGame();
        }
    };

    const resetGame = () => {
        state.gameStarted = false;
        state.flippedCards = 0;
        state.totalFlips = 0;
        state.totalTime = 0;

        selectors.win.innerHTML = '';
        selectors.boardContainer.classList.remove('flipped');

        selectors.start.classList.remove('disabled');

        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('flipped', 'matched');
        });
        location.reload();
        generateGame();
    };

    const endGame = () => {
        selectors.boardContainer.classList.add('flipped');
        selectors.moves.innerText = ``;
        selectors.timer.innerText = ``;
        selectors.win.innerHTML = `
            <div class="win-text">
                You won!<br />
                with <span class="highlight">${state.totalFlips}</span> moves<br />
                under <span class="highlight">${state.totalTime}</span> seconds
            </div>
            <div class="leaderboard-input">
                <input type="text" id="player-name" placeholder="Enter your name" />
                <button id="save-leaderboard">Save to Leaderboard</button>
            </div>
            <button id="play-again" class="play-again-button">Play Again</button>
        `;

        clearInterval(state.loop);

        selectors.input = document.querySelector('#player-name');
        selectors.saveButton = document.querySelector('#save-leaderboard');
        document.querySelector('.leaderboard-input').style.display = 'block';

        const playAgainButton = document.querySelector('#play-again');
        playAgainButton.addEventListener('click', () => {
            resetGame();
        });
    };

    const displayLeaderboard = () => {
        const leaderboard = JSON.parse(localStorage.getItem('mediumLeaderboard')) || [];
    
        // Sort by lowest time first, and if equal, by lowest moves
        const sortedLeaderboard = leaderboard.sort((a, b) => a.time - b.time || a.moves - b.moves);
    
        selectors.leaderboardList.innerHTML = sortedLeaderboard.map((entry, index) => {
            // Highlight top 1, 2, 3 players with different styles
            let highlightClass = '';
            let medalIcon = '';
            if (index === 0) {
                highlightClass = 'first-place';
                medalIcon = '<i class="fas fa-medal medal"></i>';
            } else if (index === 1) {
                highlightClass = 'second-place';
                medalIcon = '<i class="fas fa-medal medal"></i>';
            } else if (index === 2) {
                highlightClass = 'third-place';
                medalIcon = '<i class="fas fa-medal medal"></i>';
            }
    
            return `<li class="${highlightClass}">${entry.name} : ${entry.moves} moves, ${entry.time} seconds ${medalIcon}</li>`;
        }).join('');
        localStorage.clear();
    
        selectors.leaderboardSection.style.display = 'block'; // Show leaderboard section

    };
    const saveToLeaderboard = () => {
        const playerName = selectors.input.value.trim();

        if (playerName === '') {
            alert('Please enter your name.');
            return;
        }

        const leaderboard = JSON.parse(localStorage.getItem('mediumLeaderboard')) || [];
        leaderboard.push({
            name: playerName,
            time: state.totalTime,
            moves: state.totalFlips
        });

        localStorage.setItem('mediumLeaderboard', JSON.stringify(leaderboard));

        selectors.input.value = '';
        document.querySelector('.leaderboard-input').style.display = 'none';

        alert('Your score has been saved to the leaderboard!');
        displayLeaderboard(); // Display leaderboard after saving
    };

    const attachEventListeners = () => {
        document.addEventListener('click', event => {
            const eventTarget = event.target;
            const eventParent = eventTarget.parentElement;

            if (eventTarget.className.includes('card') && !eventParent.classList.contains('flipped')) {
                flipCard(eventParent);
            } else if (eventTarget.nodeName === 'BUTTON' && eventTarget.id === 'save-leaderboard') {
                event.preventDefault(); // Prevent default action to stop any unintended behavior
                saveToLeaderboard();
            } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
                startGame();
            }
        });
    };

    selectors.boardContainer.addEventListener('click', (e) => {
        if (e.target.closest('.card')) {
            flipCard(e.target.closest('.card'));
        }
    });

    selectors.start.addEventListener('click', () => {
        if (!state.gameStarted) {
            startGame();
        } else {
            resetGame();
        }
    });

    attachEventListeners();
    generateGame();
    displayLeaderboard();
});
