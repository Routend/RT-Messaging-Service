var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var db = require('../db');
var database = require('./Messages');
var app = express();
var server = http.Server(app);
var websocket = socketio(server);
var parser = require('body-parser');

app.use(parser.json());

app.get('/lastmessages', function(req, res) {
  database.lastMessage.find().where('idReceiver', req.query.userId)
  .sort('-createdAt').exec(function(err, messages) {
    res.json(messages);
  });
});

server.listen(3000, () => console.log('Listening on 3000'));

websocket.sockets.on('connection', function (socket) {
  socket.on('join', function (data) {
    socket.join(data.id);
    sendExistingMessages(socket, data.id);
  });
  socket.on('message', (message) => onMessageReceived(message, socket));
});

// // When a user sends a message in the chatroom.
function onMessageReceived(message, senderSocket) {
  sendAndSaveMessage(message, senderSocket);
}

// // Send the pre-existing messages to the user that just joined.
function sendExistingMessages(socket, roomId) {
  database.Messages.find().where('roomId', roomId)
  .sort('-createdAt').exec(function(err, messages) {
    websocket.sockets.sockets[socket.id].emit('message', messages);
  });
}

// // Save the message to the db and send all sockets but the sender.
function sendAndSaveMessage(message, socket) {
  database.lastMessage.findOneAndUpdate({$and: [{idSender: message.otherId}, {idReceiver: message.user._id}]}, {
    text: message.text, createdAt: new Date(message.createdAt), idSender: message.otherId, nameSender: message.otherName, idReceiver: message.user._id
  }, {upsert: true}, function(error, result) {
  });
  database.lastMessage.findOneAndUpdate({$and: [{idReceiver: message.otherId}, {idSender: message.user._id}]}, {
    text: message.text, createdAt: new Date(message.createdAt), idSender: message.user._id, nameSender: message.currName, idReceiver: message.otherId
  }, {upsert: true}, function(error, result) {
  });
  database.Messages.create = new database.Messages({
    text: message.text,
    user: message.user,
    roomId: message.roomId,
    createdAt: new Date(message.createdAt)
  })
  .save(function(err, message) {
    socket.broadcast.to(message.roomId).emit('message', [message]);
  });
}
