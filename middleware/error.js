const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  //spreads ( ... = spreader ) all the properties of err into the error variable
  // the error is created as it will act as a separate entity - one that gets updated accordingly based on the situation as in the Mongoose Bad ObjectID if statement
  let error = {...err};
  error.message = err.message;
  //Returns the whole error message to the console. This makes everything so much easier!
  console.log(err);

  // Mongoose Bad ObjectID
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Duplicate Error
  if (err.code === 11000) {
    const message = `Duplicate Error`;
    error = new ErrorResponse(message, 400);
  }

  //Mongoose Validation Error
  if (err.name === 'ValidationError') {
    //Object.values gets the values of the err object. The specified values (namely the message values) are then mapped (extracted) one by one with the use of the map method which iterates over each element in the object to then "map" it (put it in array). Mind that if an err Object has more than one error to display, e.g. incorrect name, no description, etc.) it will become an err Array looking something like this: err = {"errors": [{err 1},{...}, {err N}]}. Because of this fact, when extracting values from the Object we can't just say values(err). Instead, we must go one step deeper to err.errors where we have the actual error messages objects. Only then are we able to go into each object and find the .message of each
    const message = Object.values(err.errors).map(value => ` ${value.message}`);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
