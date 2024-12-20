import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();


export const server = createServer(app);

const webSocket = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});
let gameState = {
  board: ['', '', '', '', '', '', '', '', ''],  
  currentPlayer: 'X',  
  players: [],  
};

webSocket.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

     socket.on("getIn", () => {
    if (gameState.players.length < 2) {
      gameState.players.push(socket);  
      console.log(`Jogador ${socket.id} entrou no jogo.`);

      if (gameState.players.length === 2) {
        gameState.players[1].emit("gameStarted", {
          symbol: "O", 
          message: "Você é o jogador O. Aguardando oponente...",
        });

        gameState.players[0].emit("gameStarted", {
          symbol: "X", 
          message: "Você é o jogador X. Sua vez de jogar!",
        });
      }
    } 
  });
  socket.on("restart", () => {    
        
    gameState.players[1].emit("gameStarted", {
      symbol: "O", 
      message: "Você é o jogador O. Aguardando oponente...",
    });

    gameState.players[0].emit("gameStarted", {
      symbol: "X", 
      message: "Você é o jogador X. Sua vez de jogar!",
    });
  });

  socket.on('makeMove', (data) => {
    const { cellIndex, symbol } = data;

    if (gameState.board[cellIndex] === '' && gameState.currentPlayer === symbol) {
      gameState.board[cellIndex] = symbol;

      const winner = checkWinner(gameState.board);
      if (winner) {
        gameState.players.forEach(player => {
          player.emit('gameEnded', { winner });  
        });
        return resetGame(); 
      }

      gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';

      gameState.players.forEach(player => {
        player.emit('updateBoard', gameState.board);
      });
    } else {
      socket.emit('error', 'Jogada inválida. Tente novamente.');
    }
  });

  
});

function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  
    [0, 4, 8], [2, 4, 6],             
  ];

  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];  
    }
  }

  return null;  
}

function resetGame() {
  
 gameState.board = ['', '', '', '', '', '', '', '', '']; 
  gameState.players.forEach(player => {
        player.emit('updateBoard', gameState.board);
      })
}
