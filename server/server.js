const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', function (socket) {
  console.log('A new user connected.');

  socket.emit('newMessage', generateMessage('AJ', 'Welcome to Radian Chat!'));

  socket.broadcast.emit('newMessage', generateMessage('AJ', 'A fucker joined.'));

  socket.on('createMessage', function (message, callback) {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback('This is from the server.');
  });

  socket.on('createLocationMessage', function (coords) {
    io.emit('newLocationMessage', generateLocationMessage('AJ', coords.latitude, coords.longitude));
  });

  socket.on('disconnect', function () {
    console.log('Client disconnected');
  });
});


server.listen(port, function () {
  console.log(`Server listening on port ${port}...`);
});
