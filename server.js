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

//Socket.io stuff
io = socketIo(server, { transports: ['websocket', 'xhr-polling'] });

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('a user disconnected')
  });
});

//update loop
setInterval(function(){
    io.emit('update time', Date.now());
}, 100);
