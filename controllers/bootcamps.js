const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
// Description  -- Get All Bootcamps
// Route        -- GET /api/v1/bootcamps
// Access       -- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({success: true, count: bootcamps.length, data: bootcamps});
});
// Description  -- Get Single Bootcamp
// Route        -- GET /api/v1/bootcamps/:id
// Access       -- Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  //Makes it so as if the bootcamp id is correctly formatted but doesn't have any bootcamp pertaining to it, then the code returns false instead of true + no data
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({success: true, data: bootcamp});

  //Usage description of next(err) explained above app.use(errorHandler) in server.js folder
  // next(err);
  //OLD WAY => res.status(400).json({success: false});
  //We have access to next because we put it as an input variable for our (x, y, next) =>
  //The stuff in the next gets sent as an error to the error.js file and there its contents are put in according places.
  // The next() function itself is, when referenced in the server.js, a reference to the next errorHandler
  // next(err);
});
// Description  -- Create New Bootcamp
// Route        -- POST /api/v1/bootcamps
// Access       -- Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // This goes to the bootcamp model (Bootcamp is its shorter name) and it creates new bootcamp data based on the body of the users' requests
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});
// Description  -- Update Bootcamp
// Route        -- PUT /api/v1/bootcamps/:id
// Access       -- Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //If hovered tells what it does. In summary, it checks the req bootcamp by id update against the Bootcamp model schema and validates if it indeed follows the requirements
    runValidators: true
  });

  //Makes shure that the bootcamp exists in the first place, only then returning a success value and data (instead of just giving a success value without the data when an id with a correct length is input that doesn't correspond to any bootcamp)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({success: true, data: bootcamp});
});
// Description  -- Delete Bootcamp
// Route        -- DELETE /api/v1/bootcamps/:id
// Access       -- Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({success: true, data: 'Course Successfully Deleted!'});
});

// Description  -- Get Bootcamp within radius
// Route        -- GET Bootcamps within radius /api/v1/bootcamps/radius/:zipcode/:distance
// Access       -- Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const {zipcode, distance} = req.params;

  //Get latitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calculate Radius using radians
  //Divide distance by radius of the Earth
  // Earth Radius = 3,963 Miles
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
