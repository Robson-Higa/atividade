import express from "express"
import { createServer } from "http"
import { Socket, Server as SocketIOServer } from "socket.io"

const app = express()

const server = createServer(app)

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
  },
})

let players: Socket[] = []
let gameBoard: string[] = Array(9).fill("")
let currentPlayerIndex = 0

io.on("connection", (socket) => {
  console.log(`O jogador ${socket.id} se conectou`)

  socket.on("getIn", () => {
    if (players.length < 2) {
      players.push(socket)
      console.log(`Jogador ${socket.id} entrou no jogo.`)

      if (players.length === 2) {
        console.log(players)

        players[1].emit("gameStarted", {
          symbol: "O",
          message: "Você é o jogador O.",
        })

        players[0].emit("gameStarted", {
          symbol: "X",
          message: "Você é o jogador X.",
        })
      }
    }
  })

 socket.on('makeMove', (move) => {
  console.log(`Movimento recebido no servidor: ${JSON.stringify(move)}`); 

  const { cellIndex, symbol } = move;
  console.log(move)

  if (gameBoard[cellIndex] === "") {
    gameBoard[cellIndex] = symbol;
    console.log(`Tabuleiro após movimento: ${gameBoard}`); 

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

socket.on("disconnect", () => {
    console.log("Jogador desconectado")
    players = players.filter((player) => player.id !== socket.id)
  })
})

function checkWinner(): string | null {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      return gameBoard[a]
    }
  }
  return null
}

function resetGame() {
  gameBoard = Array(9).fill("")
  players = []
  currentPlayerIndex = 0
}

export { app, server }
