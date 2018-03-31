const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');

const port = 3000;

const app = express();

//make it so we can connect from the react server
app.use(cors());

//starting the server
const server = app.listen(port, () => {
  console.log("Server started on port 3000...")
});

let games = [];
let sockets = [];
let idCounter = 1;

app.get("/get_games", (req, res) => {
  res.json(games);
});

//Socket.io stuff
io = socketIo(server, { transports: ['websocket', 'xhr-polling'] });

io.on('connection', (socket) => {
  sockets.push(socket);
  console.log('A user connected');

  socket.on('disconnect', (socket) => {
    console.log('A user disconnected')
    sockets.filter((item) => {
      return item.id !== socket.id;
    });
  });

  socket.on('create game', (name) => {
    console.log("game " + name + " created");
    games.push({
      id: idCounter,
      name: name,
      player1Id: socket.id,
      player2Id: null
    });
    idCounter++;
    io.emit("update game list", JSON.stringify(games));
  });

  socket.on('join game', (id) => {
    let game = games.find((item) => {
      return item.id == id;
    });
    console.log("game " + game.name + " started");
    game.player2Id = socket.id;
    getSocket(game.player1Id).emit("game started", game);
    socket.emit("game started", game);
  });
});
