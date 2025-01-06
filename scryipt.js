document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelector(".board");
    const status = document.getElementById("status");
    const resetButton = document.getElementById("reset");
    const twoPlayersButton = document.getElementById("twoPlayers");
    const vsComputerButton = document.getElementById("vsComputer");

    let isVsComputer = false;
    let aiDifficulty = "easy"; // Könnyű, közepes vagy nehéz
    let currentPlayer = "X";
    let gameActive = true;
    let gameState = Array(9).fill(null);

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    function createBoard() {
        board.innerHTML = "";
        gameState.fill(null);
        gameActive = true;
        status.textContent = "";
        currentPlayer = "X";

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", handleCellClick);
            board.appendChild(cell);
        }
    }

    function handleCellClick(e) {
        const cell = e.target;
        const index = cell.dataset.index;

        if (gameState[index] || !gameActive) return;

        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add("taken");

        if (checkWin(currentPlayer)) {
            status.textContent = `${currentPlayer} játékos nyert.`;
            gameActive = false;
            return;
        }

        if (gameState.every(cell => cell !== null)) {
            status.textContent = "A játék döntetlen.";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";

        if (isVsComputer && currentPlayer === "O") {
            setTimeout(computerMove, 500); // AI késleltetése
        }
    }

    function computerMove() {
        let bestMove;

        if (aiDifficulty === "easy") {
            bestMove = getRandomMove();
        } else if (aiDifficulty === "medium") {
            bestMove = getMediumMove();
        } else if (aiDifficulty === "hard") {
            bestMove = getBestMove("O");
        }

        if (bestMove !== null) {
            const cell = board.children[bestMove];
            cell.click();
        }
    }

    function getRandomMove() {
        const availableMoves = gameState
            .map((val, index) => (val === null ? index : null))
            .filter(val => val !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    function getMediumMove() {
        // Nyerési lehetőség keresése
        for (let i = 0; i < gameState.length; i++) {
            if (!gameState[i]) {
                gameState[i] = "O";
                if (checkWin("O")) {
                    gameState[i] = null;
                    return i;
                }
                gameState[i] = null;
            }
        }

        // Blokkolási lehetőség keresése
        for (let i = 0; i < gameState.length; i++) {
            if (!gameState[i]) {
                gameState[i] = "X";
                if (checkWin("X")) {
                    gameState[i] = null;
                    return i;
                }
                gameState[i] = null;
            }
        }

        // Véletlenszerű lépés, ha nincs jobb
        return getRandomMove();
    }

    function getBestMove(player) {
        const opponent = player === "X" ? "O" : "X";

        function minimax(state, depth, isMaximizing) {
            if (checkWin("O")) return 10 - depth;
            if (checkWin("X")) return depth - 10;
            if (state.every(cell => cell !== null)) return 0;

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let i = 0; i < state.length; i++) {
                    if (!state[i]) {
                        state[i] = player;
                        const eval = minimax(state, depth + 1, false);
                        state[i] = null;
                        maxEval = Math.max(maxEval, eval);
                    }
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (let i = 0; i < state.length; i++) {
                    if (!state[i]) {
                        state[i] = opponent;
                        const eval = minimax(state, depth + 1, true);
                        state[i] = null;
                        minEval = Math.min(minEval, eval);
                    }
                }
                return minEval;
            }
        }

        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < gameState.length; i++) {
            if (!gameState[i]) {
                gameState[i] = player;
                const score = minimax(gameState, 0, false);
                gameState[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function checkWin(player) {
        return winningCombinations.some(combination =>
            combination.every(index => gameState[index] === player)
        );
    }

    resetButton.addEventListener("click", createBoard);

    twoPlayersButton.addEventListener("click", () => {
        isVsComputer = false;
        createBoard();
    });

    vsComputerButton.addEventListener("click", () => {
        isVsComputer = true;
        aiDifficulty = prompt(
            "Válassz nehézségi szintet: easy, medium, hard",
            "medium"
        );
        createBoard();
    });

    createBoard();
});
