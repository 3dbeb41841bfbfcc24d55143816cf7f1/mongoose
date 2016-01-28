var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
  mongoose.disconnect();
});

db.once('open', function() {
  console.log("Opened mongoose.");
});

db.once('close', function() {
  console.log("Closed mongoose.");
});

module.exports = db;
