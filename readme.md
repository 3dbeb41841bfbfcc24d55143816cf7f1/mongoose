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
- Describe how an ORM works
- Create a basic NodeJS app

## Using MongoDB with Node - Intro (5 mins)

NodeJS and MongoDB work really well together. To handle HTTP requests and read from or send data to MongoDB, Mongoose is the most common Node.js ORM to manipulate data using MongoDB: CRUD functionality is something that is necessary in almost most every application, as we still have to create, read, update, and delete data.

For this lesson, we will build a simple `Node` app using `mongoose` and `mongodb`. We will not need `express` for this lesson.

### What Is Mongoose?

Mongoose is an ODM - object document mapper - think ORM for Node. Thus mongoose gives us the ability to do CRUD operations on a MongoDB database using JavaScript objects as our model objects.

## Step 1: Create the app - Codealong (5 mins)

1a. Create a new directory for this app and configure it as a NodeJS app using npm:

```bash
mkdir cars
cd cars
npm init
```

1b. Add `mongoose` to your project:

```bash
$ npm install mongoose --save
```

1c. Edit `db.js` and add the following generic code to configure your mongoose database connection:

```javascript
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
```

1d. Add the following code to `app.js`:

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
  make:  { type: String, required: true, unique: true },
  model: { type: String, required: true, unique: true },
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

MongoDB is _schemaless_, meaning: all the documents in a collection can have different fields, but for the purpose of most web apps, enforcing some kind of validations via a _schema_ is often a good practice. The difference is that we are defining and enforcing the schema in our JavaScript code, not in the database itself!

Note the following:

* we have created and exported a `Car` model that can be used to create `mongoose` managed `Car` model objects.
* you can use hashes and nested attributes inside a hash.

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
var Car = require('./models/car');

var tesla = new Car({ make: 'Tesla', model: 'S', color: 'black', year: 2014 });
tesla.print();
```

Now run the app with `node app.js` to see the result!


## CRUD operations with Mongoose - Demo (15 mins)

#### Create

We'll create a car using the `Car` method from before, along with the `save` method from _Mongoose_:

Add the following to `main.js`:

```javascript
// a simple error handler
function handleError(err) {
  console.log('ERROR:', err);
  return err;
}

// save the car
tesla.save(function(err) {
  if (err) return handleError(err);
  console.log('Car saved!');
  quit();
});
```

We can create multiple cars in a single operation using the `save` method:

```javascript
console.log('Creating some cars...');
var theCars = [
  { make: 'Tesla',   model: 'S',   color: 'black',  year:  2014 },
  { make: 'Porsche', model: '911', color: 'silver', year:  2011 }
];
Car.create(theCars)
.then(function(savedCars) {
  ...
});
```

#### What about Read?

Just like ActiveRecord, we can use the JavaScript equivalent of `.all`, `.find_by_`, and `.find` to get a hold of what we're looking for.

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

To find only certain documents:

```javascript
Car.find({ make: 'Tesla' }, function(err, found) {
  if (err) return handleError(err);
  found.print();
});
```

The _Mongoose_ equivalent of `.find` is `.findById`:

```javascript
Car.findById(someId, function(err, user) {
  if (err) return handleError(err);
  console.log(user);
});
```

### Destroy

We are getting a lot of Teslas. Each time we run `node app.js` we are inserting another Tesla, so lets clean that up.

```javascript
console.log('Removing any old cars...');
Car.remove({}, function(err) {
  if (err) return handleError(err);
  ...
});
```

Mongoose gives you two convenience methods for deleting documents: `findByIdAndRemove()` and `.findOneAndRemove()`.

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


## What are embedded documents? Codealong (20 mins)

> Note: Go slowly through this section as we anticipate students having trouble

Embedded documents are just what they sound like: documents with their own schemas nested in other documents. They take of the form of objects within an array.  You can think of this as a sort of `has_many` relationship - the context to use embedded documents is data entities need to be used/viewed in context of another.

The nested schema are equipped with all the same features as your models: defaults, validators, middleware, and even error handling, as they are tied to the save() error callback; and Mongoose can work with embedded documents by default.


Let's look at these two schemas below - we can embed `childSchema` into the property `children`:

```javascript
var childSchema = new Schema({ name: 'string' });

var parentSchema = new Schema({
  children: [childSchema]
})

var Parent = mongoose.model('Parent', parentSchema);
var parent = new Parent({ children: [{ name: 'Matt' }, { name: 'Sarah' }] })
parent.children[0].name = 'Matthew';
parent.save(function(err) {
  if (err) return handleError(err);
  console.log('New Parent!');
});
```

Or from mongoDB official docs, we can look at this example with Patron and Address models:

```javascript
{
   _id: "joe",
   name: "Joe Bookreader"
}

{
   patron_id: "joe",
   street: "123 Fake Street",
   city: "Faketon",
   state: "MA",
   zip: "12345"
}

{
   patron_id: "joe",
   street: "1 Some Other Street",
   city: "Boston",
   state: "MA",
   zip: "12345"
}
```
The address documents make two references to the Joe Bookreader object, so instead we can:

```javascript
{
   _id: "joe",
   name: "Joe Bookreader",
   addresses: [
                {
                  street: "123 Fake Street",
                  city: "Faketon",
                  state: "MA",
                  zip: "12345"
                },
                {
                  street: "1 Some Other Street",
                  city: "Boston",
                  state: "MA",
                  zip: "12345"
                }
              ]
 }
 ```

Note that sub-documents do not save individually, only with the highest-level document; in this case, the addresses are saved with the Joe Bookreader Patron document.

#### Finding a sub-document

All documents in Mongoose have an  `_id`.  Look above at our Patron example.  Joe Bookreader has an `_id` of 'joe'.

> DocumentArrays have a special `id` method for looking up a document by its _id.

```javascript
// in our first example
var doc = parent.children.id(id_you_are_looking_for);

// in the second example
var doc = patron.addresses.id(id_you_are_looking_for)
```

#### Adding and Removing sub-docs

Remember Ruby methods like `pop`, `push`, or the `<<` operator?  We'll, Mongoose comes with MongooseArray methods like as `push`, `unshift`, `addToSet`, and others.  And just like adding them, we can remove them with `remove()`

Using code from the official docs, we can see how these are used:

```javascript
var Parent = mongoose.model('Parent');
var parent = new Parent;

// create a child
parent.children.push({ name: 'Liesl' });
var subdoc = parent.children[0];
console.log(subdoc) // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
subdoc.isNew; // true

parent.save(function (err) {
  if (err) return handleError(err)
  console.log('Success!');
});

// remove

var doc = parent.children.id(id_you_are_looking_for).remove();
parent.save(function (err) {
  if (err) return handleError(err);
  console.log('the sub-doc was removed')
});

```

Sub-docs may also be created without adding them to the array by using the create method of MongooseArrays.

```javascript
var newdoc = parent.children.create({ name: 'Aaron' });
```

## Conclusion (5 mins)
Mongoose is just a bridge to use MongoDB inside a NodeJS environment. There are a lot of options when creating a schema with Mongoose, we've just seen a few for the moment.

- How does Mongoose compare to ActiveRecord?
- How does the schema in Mongoose/Mongo/Express compare to Rails?
