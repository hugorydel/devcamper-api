const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
// Description  -- Get All Bootcamps /Get specified bootcamps
// Route        -- GET /api/v1/bootcamps
// Access       -- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  //Add user to req.body
  //The logged in user will created bootcamps so we already have access to the user.id of the user
  req.body.user = req.user.id;

  //Check published bootcamps to see if publisher is making the first or trying to make the second bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});
  //If user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with Id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
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
  let bootcamp = await Bootcamp.findById(req.params.id);

  //Makes shure that the bootcamp exists in the first place, only then returning a success value and data (instead of just giving a success value without the data when an id with a correct length is input that doesn't correspond to any bootcamp)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is the bootcamp owner
  //bootcamp.user gives us a typeof ObjectId but we want it to be a string as the req.user.id is a string
  if (bootcamp.user.toString() !== req.user.id && 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    //If hovered tells what it does. In summary, it checks the req bootcamp by id update against the Bootcamp model schema and validates if it indeed follows the requirements
    runValidators: true
  });

  res.status(200).json({success: true, data: bootcamp});
});
// Description  -- Delete Bootcamp
// Route        -- DELETE /api/v1/bootcamps/:id
// Access       -- Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is the bootcamp owner
  //bootcamp.user gives us a typeof ObjectId but we want it to be a string as the req.user.id is a string
  if (bootcamp.user.toString() !== req.user.id && 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  //We do this instead of just findingById and deleting because
  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: 'Bootcamp And Underlying Assets Successfully Deleted!'
  });
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

// Description  -- Upload photo for bootcamp
// Route        -- PUT /api/v1/bootcamps/:id/photo
// Access       -- Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please Upload An Image`, 400));
  }
  //If you check a console log of req.files you'll see that it not only returns the actual file. It also returns other data, which we don't need ergo the const.
  //File Data - console.log(req.files);
  const file = req.files.file;
  // Make sure the image is a photo. Can check if starts with image because every jpg or img file comes from the image file.
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please Upload An Image File`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Image too large`, 400));
  }

  //Create custom filename. This is used because if 2 bootcamps had pictures they wanted to upload called    duplicate.jpg one would overwrite the other. Thus, if each bootcamp has its own identifier then if we do the below bootcamp._id none of the files will overwrite.
  //Path.parse returns (in this instance) the extension of the file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  //Uploading the file
  //.mv() function moves specified file to a specified place
  //have to give some /file.name because otherwise you're just saying that the file we're sending should not go into the folder but somehow "be" the folder? IDK, just don't mess that up again and remember to give the right directions
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem With File Upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
