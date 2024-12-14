const socket = io("http://localhost:3001");

const gameBoard = document.getElementById('gameBoard');
const status = document.getElementById('status');
const restart = document.getElementById('restart');

let currentPlayer = "X";  
let board = Array(9).fill(null);  
let gameOver = false; 

const checkWinner = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]              
];

function checkGameOver() {
    for (const condition of checkWinner) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            status.textContent = `Jogador ${board[a]} venceu!`;
            highlightWinner([a, b, c]);
            return;
        }
    }
    
    if (board.every(cell => cell !== null)) {
        gameOver = true;
        status.textContent = "Empate!";
    }
}

function highlightWinner(cells) {
    cells.forEach(cellIndex => {
        document.getElementById(`data-cell-${cellIndex}`).style.backgroundColor = '#90EE90'; 
    });
}

function onCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.id.split('-')[2]);

    if (board[index] || gameOver) {
        return; 
    }

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');

    checkGameOver();

    if (!gameOver) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.textContent = `Jogador ${currentPlayer}, é a sua vez!`;
    }
    socket.on("mensagensAnteriores", (messages) => {
  messages.forEach((m) => printMessage(m));
});
}

function restartGame() {
    board = Array(9).fill(null);
    gameOver = false;
    currentPlayer = "X";
    status.textContent = `Jogador ${currentPlayer}, é a sua vez!`;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
        cell.style.backgroundColor = '#f0f0f0';  
    });
}

gameBoard.addEventListener('click', onCellClick);
restart.addEventListener('click', restartGame);
