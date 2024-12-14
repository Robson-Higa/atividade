import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

type Message = {
  text: string;
  userName: string;
};

const messages: Message[] = [];

export const server = createServer(app);

const webSocket = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});

webSocket.on("connection", (socket) => {
  console.log("Um novo cliente conectou");

  socket.on("novaMensagem", (messageObj: Message) => {
    console.log(messageObj);
    messages.push(messageObj);
    socket.broadcast.emit("chegouMensagemNova", messageObj);
  });

  socket.emit("mensagensAnteriores", messages);
});