var mongoose = require('mongoose');

var CarSchema = new mongoose.Schema({
  make:  { type: String, required: true },
  model: { type: String, required: true },
  year:  Number,
  color: String,
  owner: {
    imageUrl: String,
    country: String,
    contactName: String,
    contactNumber: String
  }
});

CarSchema.methods.print = function() {
  console.log(this._id + ' ' + this.color + ' ' + this.year + ' ' + this.make + ' ' + this.model);
};

module.exports = mongoose.model('Car', CarSchema);
