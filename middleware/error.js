const errorHandler = (err, req, res, next) => {
  // Log To Console for developer
  //err.stack gives all the file info and the error
  console.log(err.stack.red);
  res.status(500).json({
    success: false,
    error: err.message
  });
};

module.exports = errorHandler;
