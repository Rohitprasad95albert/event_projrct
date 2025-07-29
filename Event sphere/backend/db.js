const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
//const mongoURL = process.env.MONGODB_URL_LOCAL   // in last addded database name allready created or to be created on that name
const mongoURL = process.env.MONGODB_URL;

// set up MongoDB connection
mongoose.connect(mongoURL,
 {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})



//Get the default connection
//Mongoose maintains a default connection object representing the mongoDB connection.

const db = mongoose.connection;

// define event listeners for database connection

db.on('connected',() => {
    console.log("Connected to MongoDB Server");
});

db.on('error',() => {
    console.log("MongoDB connection errror");
});

db.on('disconnected',() => {
    console.log("MongoDB disconnected");
});

// Export the database connection
module.exports = db;