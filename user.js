var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, required: true, unique: true },
  meta: {
    age: Number,
    website: String,
    address: String,
    country: String,
  },
  created_at: Date,
  updated_at: Date
});

var User = mongoose.model('User', userSchema);

// make this available to our other files
module.exports = User;
