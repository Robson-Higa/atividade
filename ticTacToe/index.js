const socket = io('http://127.0.0.1:3001');  

const joinButton = document.getElementById('getIn'); 
let character = 'X';  
if (joinButton) {
  joinButton.addEventListener('click', () => {
    socket.emit('getIn');  
    joinButton.disabled = true;  
  });
}

const boardElement = document.getElementById('board');

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;  
  cell.addEventListener('click', () => makeMove(i));  
  boardElement.appendChild(cell);
}

socket.on('setPlayer', (data) => {
  character = data.symbol; 
  document.getElementById('status').textContent = `Sua vez de jogar! (Você é ${character})`;
  document.getElementById('gameBoard').classList.remove('hidden');  
});

socket.on('gameStarted', (data) => {
  document.getElementById('status').textContent = data.message;
  character = data.symbol;  
  document.getElementById('gameBoard').classList.remove('hidden'); 
  document.getElementById('getIn').classList.add('hidden'); 

});

function makeMove(cellIndex) {
  if (!character) return;  

  socket.emit('makeMove', { cellIndex, symbol: character });  
}

socket.on('updateBoard', (newBoard) => {
  const cells = document.querySelectorAll('.cell');
  newBoard.forEach((symbol, index) => {
    cells[index].textContent = symbol;  
  });
});

socket.on('error', (message) => {
  document.getElementById('status').textContent = message; 
});

socket.on('gameEnded', (data) => {
  const winner = data.winner;
  document.getElementById('status').textContent = `${winner} ganhou a partida!`;
  document.getElementById('gameBoard').classList.add('hidden');  
  joinButton.disabled = false
  document.getElementById('getIn').classList.remove('hidden');
  document.getElementById('getIn').classList.replace('teste', 'btnReiniciar');
  document.getElementById('getIn').textContent = 'Reiniciar';
  
  let clickCount = 0;
  if (joinButton) {
  joinButton.addEventListener('click', () => {
    clickCount++;
    console.log(`${ clickCount }`)
    socket.emit('restart');  
    joinButton.disabled = true;  
  });
}
});
