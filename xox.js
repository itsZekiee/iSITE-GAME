const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('gameBoard');
const statusElement = document.getElementById('status');
const resultElement = document.getElementById('result');
const restartButton = document.getElementById('restartButton');
const winnerModal = document.getElementById('winnerModal');
const winnerMessage = document.getElementById('winnerMessage');
const newMatchButton = document.getElementById('newMatchButton');
const closeModal = document.querySelector('.close');
const startButton = document.getElementById('startButton');
let oTurn, xTimer, oTimer, gameInterval;
const turnTimeLimit = 10; // 20 seconds per player for the entire game
const winThreshold = 3; // Number of wins required to win the match
let back = document.getElementById('backBtn');

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
newMatchButton.addEventListener('click', () => {
    winnerModal.style.display = 'none'; // Hide the modal
    startGame(); // Start a new match
});
closeModal.addEventListener('click', () => {
    winnerModal.style.display = 'none'; // Hide the modal
});

window.onclick = function(event) {
    if (event.target === winnerModal) {
        winnerModal.style.display = 'none'; // Hide the modal if the user clicks outside
    }
};

function startGame() {
    startButton.style.display = 'none'; // Hide the start button once the game starts
    oTurn = false;
    xTimer = turnTimeLimit;
    oTimer = turnTimeLimit;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning-cell');
        cell.textContent = ''; 
        cell.classList.remove('cell-disabled'); 
        cell.removeEventListener('click', handleClick); 
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    restartButton.style.display = 'inline-block';
    clearInterval(gameInterval);
    startGameTimer(); // Start the countdown timer for both players
    displayWins();
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
        saveWinner(currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
    }
}

function endGame(draw, winnerClass = null) {
    clearInterval(gameInterval);
    if (draw) {
        statusElement.textContent = "It's a Draw!";
    } else {
        statusElement.textContent = `${winnerClass.toUpperCase()} Wins!`;
    }
    disableCells();
    restartButton.style.display = 'inline-block';
}

function disableCells() {
    cellElements.forEach(cell => {
        cell.classList.add('cell-disabled');
    });
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass === X_CLASS ? 'X' : 'O';
}

function swapTurns() {
    oTurn = !oTurn;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    if (oTurn) {
        board.classList.add(O_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

function checkWin(currentClass) {
    let winningCombination = null;
    WINNING_COMBINATIONS.some(combination => {
        if (combination.every(index => cellElements[index].classList.contains(currentClass))) {
            winningCombination = combination;
            return true;
        }
        return false;
    });

    if (winningCombination) {
        markWinningCombination(winningCombination, currentClass);
        return true;
    }

    return false;
}

function markWinningCombination(combination, currentClass) {
    combination.forEach(index => {
        cellElements[index].classList.add('winning-cell');
    });
}

function startGameTimer() {
    const interval = 100; // Update every 100 milliseconds
    let timeLeftX = turnTimeLimit;
    let timeLeftO = turnTimeLimit;
    
    gameInterval = setInterval(() => {
        if (oTurn) {
            timeLeftO -= interval / 1000;
        } else {
            timeLeftX -= interval / 1000;
        }

        if (timeLeftX <= 0) {
            clearInterval(gameInterval);
            saveWinner(O_CLASS);  // O wins because X ran out of time
            endGame(false, O_CLASS);  // End the game and announce O as the winner
        } else if (timeLeftO <= 0) {
            clearInterval(gameInterval);
            saveWinner(X_CLASS);  // X wins because O ran out of time
            endGame(false, X_CLASS);  // End the game and announce X as the winner
        } else {
            statusElement.innerHTML = `
    <span class="turn-info">Current Turn: ${oTurn ? 'O' : 'X'}</span>
    <div class="timer-info">
        <span class="x-timer">X Time: ${timeLeftX.toFixed(1)}s</span> | 
        <span class="o-timer">O Time: ${timeLeftO.toFixed(1)}s</span>
    </div>
`;
        }
    }, interval);
}

function saveWinner(winnerClass) {
    const winner = winnerClass.toUpperCase();
    let wins = JSON.parse(localStorage.getItem('ticTacToeWins')) || { X: 0, O: 0 };
    wins[winner]++;
    localStorage.setItem('ticTacToeWins', JSON.stringify(wins));

    if (wins[winner] >= winThreshold) {
        // Display modal with match result
        winnerMessage.textContent = `${winner} wins the match!`;
        winnerModal.style.display = 'block'; // Show the modal
        localStorage.removeItem('ticTacToeWins');
    } else {
        displayWins();
    }
}

function displayWins() {
    const wins = JSON.parse(localStorage.getItem('ticTacToeWins')) || { X: 0, O: 0 };
    resultElement.innerHTML = `
    <span style="color: red;">X Wins: ${wins.X}</span> |
    <span style="color: green;">O Wins: ${wins.O}</span>
    `;
}

back.addEventListener('click', () => {
    localStorage.removeItem('ticTacToeWins');
    window.location.href = 'xoxhomepage.html';
});
