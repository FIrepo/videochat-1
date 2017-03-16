var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('server/public'));

io.on('connection', function (socket) {

  socket.on('video', function (blob) {
    socket.broadcast.volatile.emit('video', blob);
  });

  socket.on('audio', function (blob) {
    socket.broadcast.volatile.emit('audio', blob);
  });
});

server.listen(process.env.PORT || 3000);

console.log("Server running on http://localhost:3000/");
