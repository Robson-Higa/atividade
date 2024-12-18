const socket = io('http://127.0.0.1:3001');  

const joinButton = document.getElementById('getIn');
const messageElement = document.getElementById('message');
const gameBoard = document.getElementById('gameBoard');
const state = document.getElementById('state'); 
let character = '';  

function displayMessage(message) {
  messageElement.innerHTML = message;
}

if (joinButton) {
  joinButton.addEventListener('click', () => {
    socket.emit('getIn');
    displayMessage('Aguardando...');
  });
}

socket.on('gameStarted', (data) => {
  console.log(data);
  character = data.symbol;  
  console.log(character);
  displayMessage(`Você é o jogador ${character}.`);
  gameBoard.classList.remove('hidden');  
  joinButton.classList.add('hidden');

});

socket.on('moveMade', (move) => {
  console.log(`Movimento recebido do servidor: ${JSON.stringify(move)}`); // Para verificar os dados
  updateBoard(move); 
  state.innerText = `Agora é a vez de ${move.symbol === 'X' ? 'O' : 'X'}`;
});


socket.on('turn', (data) => {
  if (data.symbol === character) {
     gameBoard.classList.remove('hidden'); 
    state.innerText = 'Sua vez de jogar!';
  } else {
     gameBoard.classList.remove('hidden'); 
    state.innerText = `Esperando oponente...`;
  }
});
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', function () {
    const cellIndex = this.getAttribute('data-index'); 
    window.makeMove(cellIndex);
  });
});

window.makeMove = function (cellIndex) {
  if (!gameBoard.classList.contains('hidden')) {
    console.log(cellIndex);
    console.log(character);
    gameBoard.classList.remove('hidden'); 
    socket.emit('makeMove', { cellIndex, symbol: character });
    updateBoard({ cellIndex, symbol: character });  
  }
};


function updateBoard(move) {
  const { cellIndex, symbol } = move;
  const cell = document.getElementById(`cell-${cellIndex}`);
  
  if (cell && !cell.innerHTML) { 
    cell.innerHTML = symbol;  
}
}
