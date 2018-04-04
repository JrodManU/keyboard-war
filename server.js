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

  socket.on('disconnect', () => {
    quitSocketsGame(socket.id);
    //removes the socket that disconnected
    sockets = sockets.filter((item) => {
      return item.id !== socket.id;
    });
    console.log('A user disconnected');
  });

  socket.on('create game', (name) => {
    console.log("game " + name + " created");
    games.push({
      id: idCounter,
      name: name,
      socket1Id: socket.id,
      socket2Id: null
    });
    idCounter++;
    emitUpdatedGameList();
  });

  socket.on('join game', (gameId) => {
    let game = games.find((item) => {
      return item.id == gameId;
    });
    console.log("game " + game.name + " started");
    game.socket2Id = socket.id;
    getSocket(game.socket1Id).emit("game started", game);
    socket.emit("game started", game);
    emitUpdatedGameList();
  });

  socket.on('quit game', () => {
    quitSocketsGame(socket.id);
  })
});

function quitSocketsGame(socketId) {
  let game = findGameBySocket(socketId);
  if(game) {
    getSocket(socketId).emit("game ended");
    getOtherSocket(game, socketId).emit("game ended");
    //removes the game
    games = games.filter((item) => {
      return item.id !== game.id;
    });
    console.log("game " + game.name + " has been terminated");
  } else {
    console.log("cannot quit, player is not in game");
  }
}

function emitUpdatedGameList() {
  io.emit("update game list", JSON.stringify(
    games.filter((item) => {
      //Will return games that have not been joined yet
      return !item.socket2Id
    })
  ));
}

function getSocket(socketId) {
  return sockets.find((item) => {
    return item.id === socketId;
  });
}
function findGameBySocket(socketId) {
  return games.find((item) => {
    return item.socket1Id == socketId || item.socket2Id == socketId;
  });
}
function getOtherSocket(game, socketId) {
  return getSocket(game.socket1Id == socketId ? game.socket2Id : game.socket1Id);
}
