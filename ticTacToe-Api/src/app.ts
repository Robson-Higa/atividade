import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://127.0.0.1:5500",  
    methods: ["GET", "POST"],
  },
});

let players: string[] = [];  
let gameBoard: string[] = Array(9).fill(""); 
let currentPlayerIndex = 0;  

io.on('connection', (socket) => {
  console.log('Um jogador se conectou');

  socket.emit('message', 'Bem-vindo ao jogo da velha! Aguardando outro jogador...');

  socket.on('joinGame', () => {
    if (players.length < 2) {
      players.push(socket.id);  
      console.log(`Jogador ${socket.id} entrou no jogo.`);

      if (players.length === 1) {
        socket.emit('gameStarted', { symbol: 'X', message: 'Você é o jogador X. Sua vez!' });
      } else if (players.length === 2) {
        io.emit('gameStarted', { message: 'O jogo começou! Jogador X contra Jogador O' });
      }
    } else {
      socket.emit('message', 'Já existe uma partida em andamento. Tente mais tarde.');
    }
  });

  socket.on('makeMove', (move) => {
    const { cellIndex, symbol } = move;

    if (gameBoard[cellIndex] === "") {
      gameBoard[cellIndex] = symbol;  

      socket.broadcast.emit('moveMade', { cellIndex, symbol });

      const winner = checkWinner();
      if (winner) {
        io.emit('gameOver', `Jogador ${winner} venceu!`);
        resetGame(); 
      } else {
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        const nextPlayerSymbol = currentPlayerIndex === 0 ? 'X' : 'O';
        io.emit('turn', { symbol: nextPlayerSymbol });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
    players = players.filter(player => player !== socket.id);  
  });
});

function checkWinner(): string | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  
    [0, 4, 8], [2, 4, 6],             
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      return gameBoard[a]; 
    }
  }
  return null; 
}

function resetGame() {
  gameBoard = Array(9).fill(""); 
  players = []; 
  currentPlayerIndex = 0; 
}

export { app, server };
