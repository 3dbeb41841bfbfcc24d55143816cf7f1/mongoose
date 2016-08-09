# Introduction to Models with Mongoose

### Objectives
*After this lesson, students will be able to:*

- Update & destroy a model
- Initialize & create a new instance of a model
- Perform basic find queries
- Reference other documents in an instance of a model
- Work with embedded and referenced documents with Mongoose

### Preparation
*Before this lesson, students should already be able to:*

- Describe how Mongo documents work
- Describe how an ORM/ODM works
- Create a basic NodeJS app

## Using MongoDB with Node - Intro (5 mins)

_NodeJS_ and _MongoDB_ work really well together. To handle HTTP requests and read from or send data to _MongoDB_, _Mongoose_ is the most common Node.js _ODM_ to manipulate data using _MongoDB_: _CRUD_ functionality is something that is necessary in almost every application, as we still have to _C_reate, _R_ead, _U_pdate, and _D_elete data.

For this lesson, we will build a simple `Node` app using `mongoose` and `mongodb`. We will *not* need `express` for this lesson.

### What Is Mongoose?

_Mongoose_ is an _ODM_ - an _O_bject _D_ocument _M_apper - i.e. it maps objects to documents. Therefore, Mongoose gives us the ability to do _CRUD_ operations on a _MongoDB_ database using JavaScript objects as our model objects.

> A _model_ object is an object whose primary concern is to hold data and represent an instance of a Domain Model. For example, if we were developing an application for Delta, we might have Domain Models for Airports, Fights, Passengers, Luggage, etc.  Instances of an Airport Domain Model might be ATL, LAX, ORD, DFW, etc.

![Object Document Mapping](images/object-document-mapping.png)

## Step 1: Create the app - Codealong (5 mins)

1a. Create a new directory for this app and configure it as a NodeJS app using npm:

```bash
mkdir cars
cd cars
npm init
```

1b. Add `mongoose` to your project:

```bash
npm install mongoose --save
```

1c. Create a file called `db.js`:

```bash
touch db.js
```

Add the following generic code to `db.js` to configure your mongoose database connection:

```javascript
var mongoose = require('mongoose');

var db = mongoose.connection;

// CONNECTION EVENTS
db.once('open', function() {
  console.log("Opened mongoose.");
});
db.once('close', function() {
  console.log("Closed mongoose.");
});
db.on('connected', function() {
  console.log('Mongoose connected to ' + db.host + ':' + db.port + '/' + db.name);
});
db.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
db.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

module.exports = db;
```

1d. Create a file called `app.js`:

```bash
touch app.js
```

Add the following code to `app.js`:

```javascript
var mongoose = require('mongoose');
var db = require('./db');

// Connect to the database
// To connect use the following:
//   mongoose.connect('mongodb://username:password@localhost:27027/dbname');
// where the username, password, and port are all optional
mongoose.connect('mongodb://localhost/cars');

// our app will not exit until we have disconnected from the db.
function quit() {
  mongoose.disconnect();
  console.log('All Done!');
}

// wait 2 seconds and then quit
setTimeout(function() {
  quit();
}, 2000);
```

1e. Test it out

```bash
node app.js
```

## Working with Models - Codealong (20 mins)

### Defining a Model

We must build a `Mongoose` _Model_ before we can use any of the `mongoose` CRUD operations. Think of a _model_ as constructor function that we define using `mongoose` to specify the _schema_ for the _model_. Objects created from the _model_ will represent the _documents_ in the MongoDB database.

From within our cars project:

```bash
touch car.js
```

Now let's add the following code to `car.js`:

```javascript
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

module.exports = mongoose.model('Car', CarSchema);
```

> NOTE: MongoDB is _schemaless_, meaning: all the documents in a collection can have different fields, but for the purpose of most web apps, enforcing some kind of validations via a _schema_ is often a good practice. The difference is that we are defining and enforcing the schema in our JavaScript code (via Mongoose) instead of in the database itself. Thus MongoDB does not enforce a schema, ___but Mongoose does___!

Note the following about our `Car` Model:

* We have created and exported a `Car` model that can be used to create `mongoose` managed `Car` model objects.
* You can use hashes and nested attributes inside a hash.

Here's a look at the datatypes we can use in Mongoose documents:

- String
- Number
- Date
- Boolean
- Array
- Buffer
- Mixed
- ObjectId

Also, notice we create the Mongoose Model with `mongoose.model`. Remember, we can define custom methods here - this would be where we could write a method to encrypt a password.

#### Creating Custom Methods

When defining a schema, you can add custom methods and call these methods on the models.  You can even overwrite the default Mongoose document methods.

Edit `car.js` and add a `print` function to our schema:

```javascript
CarSchema.methods.print = function() {
  console.log(this.color + ' ' + this.year + ' ' + this.make + ' ' + this.model);
};

module.exports = mongoose.model('Car', CarSchema);
```

Now we can call it by requiring the Car model in app.js:

```javascript
var Car = require('./car');

var tesla = new Car({ make: 'Tesla', model: 'S', color: 'black', year: 2014 });
tesla.print();
```

Now run the app with `node app.js` to see the result!


## CRUD operations with Mongoose - Demo (15 mins)

#### Create

We'll create a car using the `Car` method from before, along with the `save` method from _Mongoose_:

First _remove_ the following code from `app.js`:

```javascript
// wait 2 seconds and then quit
setTimeout(function() {
  quit();
}, 2000);
```

Then add the following to `app.js`:

```javascript
// a simple error handler
function handleError(err) {
  console.log('ERROR:', err);
  return err;
}

// save the car to the DB
tesla.save(function(err, saved) {
  if (err) return handleError(err);
  console.log('Car saved:', saved);
  quit();
});
```

Run the app:

```
node app.js

    black 2014 Tesla S
    Mongoose connected to localhost:27017/cars
    Opened mongoose.
    Car saved: { owner: {},
      _id: 572b5948b107ae9f55a1a338,
      year: 2014,
      color: 'black',
      model: 'S',
      make: 'Tesla',
      __v: 0 }
    All Done!
    Mongoose disconnected
    Closed mongoose.
```

Notice that the `saved` car has an `_id` value that was assigned to it by MongoDB!

> NOTE: We can also create multiple cars in a single operation using the `save` method:

```javascript
console.log('Creating some cars...');
var theCars = [
  { make: 'Tesla',   model: 'S',   color: 'black',  year:  2014 },
  { make: 'Porsche', model: '911', color: 'silver', year:  2011 }
];
Car.create(theCars, function(err, savedCars) {
  ...
});
```

#### What about Read?

Just like ActiveRecord, we can use the JavaScript equivalent of `.all`, `.find_by_`, and `.find` to retrieve the data we are looking for.

Inside `app.js` replace the call to `quit()` with the following:

```javascript
// Find All
Car.find({}, function(err, cars) {
  if (err) return handleError(err);
  cars.forEach(function(car) {
    car.print();
  });
  quit();
});
```

> NOTE: To find only certain documents:

```javascript
Car.find({ make: 'Tesla' }, function(err, found) {
  if (err) return handleError(err);
  found.print();
});
```

You can also find a car by its ID:

```javascript
Car.findById(someId, function(err, user) {
  if (err) return handleError(err);
  console.log(user);
});
```

### Destroy

We are getting a lot of cars. Each time we run `node app.js` we are inserting more cars, so lets clean that up by adding the following code to `app.js`:

```javascript
console.log('Removing any old cars...');
Car.remove({}, function(err) {
  if (err) return handleError(err);
  ...
});
```

> NOTE: Mongoose gives you two convenience methods for deleting documents: `findByIdAndRemove()` and `.findOneAndRemove()`.

### Update

For update, you can do it in one of two ways (that are super easy!) - using `.findByIdAndUpdate()` or `.findOneAndUpdate()`:

```javascript
console.log('Updating the Tesla...');
var updates = { model: 'X', color: 'beige'};
var options = { new: true };
Car.findOneAndUpdate({ make: 'Tesla' }, updates, options, function(err, updated) {
  if (err) return handleError(err);
  console.log('Updated!');
  updated.print();
  quit();
});
```

## Avoiding Callback Hell - Promises

See `promises.js` for an example using promises instead of callbacks to control the order of execution and avoid race conditions.

## LAB Exercise - MongoDB Movies Database

Movies are always fun. Using the concepts and some of the code from the code-along, write a JavaScript app called `movie-app.js` that uses the `db.js` file from our code-along to populate a movies database in MongoDB. Create the file `movie.js` that defines your Mongoose `Movie` model. A movie should have the following properties:

* title: String            (required)
* genre: String            (required)
* releaseYear: Number      (optional)
* director: String         (optional)
* rating: Number           (optional)

Feel free to add any other fields you want.

Use the `Movie` model to create some movies and save them to your database.
Write a function that returns all of the movies of a specific genre:

```javascript
function getMoviesByGenre(genre) {
  // TODO: Mongoose code goes here, including code to print the movies
}

Write a function to update the rating of a movie:

```javascript
function updateRating(movieId, rating) {
  // TODO: Mongoose code goes here.
}
```

Try calling the functions to test them out.

### Bonus: Write the code using promises instead of callbacks.


## Embedded Documents

[Embedded Documents](embedded-docs.md)

## Conclusion (5 mins)
Mongoose is just a bridge to use MongoDB inside a NodeJS environment. There are a lot of options when creating a schema with Mongoose, we've just seen a few for the moment.

- How does Mongoose compare to ActiveRecord?
- How does the schema in Mongoose/Mongo/Express compare to Rails?
