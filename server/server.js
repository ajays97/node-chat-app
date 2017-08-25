const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', function (socket) {
  console.log('A new user connected.');

  socket.on('join', function (params, callback) {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('GeekBot', 'Welcome to Radian Chat!'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('GeekBot', `${params.name} has joined.`));

    callback();
  });

  socket.on('createMessage', function (message, callback) {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback();
  });

  socket.on('createLocationMessage', function (coords) {
    io.emit('newLocationMessage', generateLocationMessage('GeekBot', coords.latitude, coords.longitude));
  });

  socket.on('disconnect', function () {
    console.log('Client disconnected');
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('GeekBot', `${user.name} has left.`));
    }
  });
});


server.listen(port, function () {
  console.log(`Server listening on port ${port}...`);
});
