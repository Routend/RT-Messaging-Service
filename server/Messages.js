var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema({
  text: {type: String},
  user: {type: Object},
  roomId: {type: String},
  createdAt: {type: Date}
}, {collection: 'messages'});

var lastMessageSchema = new Schema({
  text: {type: String},
  createdAt: {type: Date},
  idSender: {type: Number},
  idReceiver: {type: Number},
  nameSender: {type: String},
  nameReceiver: {type: String}
}, {collection: 'lastMessage'});

var Messages = mongoose.model('messages', messageSchema);

var lastMessage = mongoose.model('lastMessage', lastMessageSchema);

exports.Messages = Messages;
exports.lastMessage = lastMessage;
