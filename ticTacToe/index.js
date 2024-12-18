document.addEventListener('DOMContentLoaded', function () {
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
    console.log(data)
    character = data.symbol;  
    displayMessage(`Você é o jogador ${character}. Sua vez!`);
    gameBoard.classList.remove('hidden');  

  });

  socket.on('moveMade', (move) => {
    updateBoard(move);  
    state.innerText = 'Sua vez de jogar!';
  });

  socket.on('turn', (data) => {
    if (data.symbol === character) {
      state.innerText = 'Sua vez de jogar!';
    } else {
      state.innerText = `Esperando oponente...`;
    }
  });

  window.makeMove = function (cellIndex) {
    if (!gameBoard.classList.contains('hidden') && state.innerText.includes('Sua vez')) {
      socket.emit('makeMove', { cellIndex, symbol: character });
      updateBoard({ cellIndex, symbol: character });  
    }
  };

  function updateBoard(move) {
    const { cellIndex, symbol } = move;
    const cell = document.getElementById(`cell-${cellIndex}`);
    cell.innerHTML = symbol;
  }
});
