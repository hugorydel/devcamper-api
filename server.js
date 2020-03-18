const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// Adds colors to terminal logs
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
// Load env vars
dotenv.config({path: './config/config.env'});

//connect to database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

// Body Parser
app.use(express.json());

//Developer logging middleware. Visually usefull
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mounts routers - all specified routers will have this attached to beggining. Attaches the "/api/v1/bootcamps" thing before each bootcamps route originally from the routes folder.
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

//Uses the error.js custom middleware module to log errors for bootcamp controllers most often originating from bootcamps.js that have a next(err) as their catch.
// The next(err) in bootcamps (example:getBootcamps) is used in the code as the next references the next middleware, the one below. err is put inside the next as the errorHandler requires an err to execute properly (it executes only when an error occurs of course)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}...`.yellow
      .bold
  )
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Close server and exit process
  server.close(() => process.exit(1));
});
