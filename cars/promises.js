var mongoose = require('mongoose');
var db = require('./db');
var Car = require('./car');

// Connect to the database
// To connect use the following:
//   mongoose.connect('mongodb://username:password@localhost:27027/dbname');
// where the username, password, and port are all optional
mongoose.connect('mongodb://localhost/cars');

// a simple error handler
function handleError(err) {
  console.log('ERROR:', err);
  return err;
}

// our app will not exit until we have disconnected from the db.
function quit() {
  mongoose.disconnect();
  console.log('All Done!');
}

console.log('Removing any old cars...');
Car.remove({})
.then(function() {
  console.log('Creating some cars...');
  var theCars = [
    { make: 'Tesla',   model: 'S',   color: 'black',  year:  2014 },
    { make: 'Porsche', model: '911', color: 'silver', year:  2011 }
  ];
  return Car.create(theCars)
})
.then(function(savedCars) {
  console.log('Finished creating cars:', savedCars.length);
  console.log('Fetching all cars...');
  return Car.find({});
})
.then(function(fetchedCars) {
  fetchedCars.forEach(function(car) {
    car.print();
  });
  console.log('Fetching all of the Teslas');
  return Car.find({ make: 'Tesla' });
})
.then(function(found) {
  found.forEach(function(car) {
    car.print();
  });
  console.log('Updating the Tesla...');
  var updates = { model: 'X', color: 'beige'};
  var options = { new: true };
  return Car.findOneAndUpdate({ make: 'Tesla' }, updates, options);
})
.then(function(updated) {
  console.log('Updated!');
  updated.print();
  quit();
})
.then(null, function(err) {
  return handleError(err);
});
