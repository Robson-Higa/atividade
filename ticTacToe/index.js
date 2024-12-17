document.addEventListener('DOMContentLoaded', function () {
  const socket = io('http://127.0.0.1:3001');  

  const joinButton = document.getElementById('joinGame');
  const messageElement = document.getElementById('message');
  const gameBoard = document.getElementById('gameBoard');
  const gameState = document.getElementById('gameState'); 
  let playerSymbol = '';  

  function displayMessage(message) {
    messageElement.innerHTML = message;
  }

  if (joinButton) {
    joinButton.addEventListener('click', () => {
      socket.emit('joinGame');
      displayMessage('Aguardando oponente...');
    });
  }

  socket.on('gameStarted', (data) => {
    playerSymbol = data.symbol;  
    displayMessage(`Você é o jogador ${playerSymbol}. Sua vez!`);
    gameBoard.classList.remove('hidden');  
    gameState.innerText = `Jogador ${playerSymbol}: sua vez de jogar!`;
  });

  socket.on('moveMade', (move) => {
    updateBoard(move);  
    gameState.innerText = 'Sua vez de jogar!';
  });

  socket.on('turn', (data) => {
    if (data.symbol === playerSymbol) {
      gameState.innerText = 'Sua vez de jogar!';
    } else {
      gameState.innerText = `Esperando oponente...`;
    }
  });

  window.makeMove = function (cellIndex) {
    if (!gameBoard.classList.contains('hidden') && gameState.innerText.includes('Sua vez')) {
      socket.emit('makeMove', { cellIndex, symbol: playerSymbol });
      updateBoard({ cellIndex, symbol: playerSymbol });  
    }
  };

  function updateBoard(move) {
    const { cellIndex, symbol } = move;
    const cell = document.getElementById(`cell-${cellIndex}`);
    cell.innerHTML = symbol;
    cell.classList.add(symbol === 'X' ? 'x-class' : 'o-class');
  }
});
