var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/routend');

module.exports = db;