const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', function (socket) {
  console.log('A new user connected.');

  socket.emit('newMessage', generateMessage('Ajay Srinivas', 'Welcome to Radian Chat!'));

  socket.broadcast.emit('newMessage', generateMessage('Ajay Srinivas', 'A fucker joined.'));

  socket.on('createMessage', function (message, callback) {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback('This is from the server.');

    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });

  });

  socket.on('disconnect', function () {
    console.log('Client disconnected');
  });
});


server.listen(port, function () {
  console.log(`Server listening on port ${port}...`);
});
