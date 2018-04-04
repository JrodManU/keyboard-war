const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');

const port = 3000;

const app = express();

//global variables not directly related to the server
const LOBBY_KEY = "lobby";
let games = [];
let sockets = [];
let idCounter = 1;

//make it so we can connect from the react server
app.use(cors());

//starting the server
const server = app.listen(port, () => {
  console.log("Server started on port 3000...")
});

//routes
app.get("/get_games", (req, res) => {
  res.json(games);
});

//Socket.io stuff
io = socketIo(server, { transports: ['websocket', 'xhr-polling'] });

io.on('connection', (socket) => {
  sockets.push(socket);
  socket.join(LOBBY_KEY);
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
    games.push({
      id: idCounter,
      name: name,
      socket1Id: socket.id,
      socket2Id: null
    });
    idCounter++;
    console.log("game " + name + " created");
    emitUpdatedGameList();
  });

  socket.on('join game', (gameId) => {
    let game = games.find((item) => {
      return item.id === gameId;
    });
    //Both join the room once a second person joins the game
    otherSocket = io.sockets.connected[game.socket1Id];
    game.socket2Id = socket.id;
    socket.leave(LOBBY_KEY);
    socket.join(game.id);
    otherSocket.leave(LOBBY_KEY);
    otherSocket.join(game.id);
    io.in(game.id).emit("game started", game);
    console.log("game " + game.name + " started");
    emitUpdatedGameList();
  });

  socket.on('quit game', () => {
    quitSocketsGame(socket.id);
  })
});

function quitSocketsGame(socketId) {
  let game = findGameBySocket(socketId);
  if(game) {
    io.in(game.id).emit("game ended");
    //empties room to be disposed
    socketIds = Object.keys(io.sockets.adapter.rooms[game.id].sockets);
    socketIds.forEach((item) => {
      io.sockets.connected[item].leave(game.id);
    });
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
  io.in(LOBBY_KEY).emit("update game list", JSON.stringify(
    games.filter((item) => {
      //Will return games that have not been joined yet
      return !item.socket2Id
    })
  ));
}
function findGameBySocket(socketId) {
  return games.find((item) => {
    return item.socket1Id == socketId || item.socket2Id == socketId;
  });
}
