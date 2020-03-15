const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

// Description  -- Get All Bootcamps
// Route        -- GET /api/v1/bootcamps
// Access       -- Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res
      .status(200)
      .json({success: true, count: bootcamps.length, data: bootcamps});
  } catch (err) {
    res.status(400).json({success: false});
  }
};
// Description  -- Get Single Bootcamp
// Route        -- GET /api/v1/bootcamps/:id
// Access       -- Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //Makes it so as if the bootcamp id is correctly formatted but doesn't have any bootcamp pertaining to it, then the code returns false instead of true + no data
    if (!bootcamp) {
      return res.status(400).json({success: false});
    }
    res.status(200).json({success: true, data: bootcamp});
  } catch (err) {
    //Usage description of next explained above app.use(errorHandler) in server.js folder
    next(err);
    //OLD WAY => res.status(400).json({success: false});
    //We have access to next because we put it as an input variable for our (x, y, next) =>
    //The next(err) finds middleware functions in server.js (app.use(errorHandler) in this instance, and it turns them on)
    // next(
    //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    // );
  }
};
// Description  -- Create New Bootcamp
// Route        -- POST /api/v1/bootcamps
// Access       -- Private
exports.createBootcamp = async (req, res, next) => {
  try {
    // This goes to the bootcamp model (Bootcamp is its shorter name) and it creates new bootcamp data based on the body of the users' requests
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    res.status(400).json({success: false});
  }
};
// Description  -- Update Bootcamp
// Route        -- PUT /api/v1/bootcamps/:id
// Access       -- Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //If hovered tells what it does. In summary, it checks the req bootcamp by id update against the Bootcamp model schema and validates if it indeed follows the requirements
      runValidators: true
    });

    //Makes shure that the bootcamp exists in the first place, only then returning a success value and data (instead of just giving a success value without the data when an id with a correct length is input that doesn't correspond to any bootcamp)
    if (!bootcamp) {
      return res.status(400).json({success: false});
    }

    res.status(200).json({success: true, data: bootcamp});
  } catch (err) {
    res.status(400).json({success: false});
  }
};
// Description  -- Delete Bootcamp
// Route        -- DELETE /api/v1/bootcamps/:id
// Access       -- Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({success: false});
    }

    res.status(200).json({success: true, data: 'Course Successfully Deleted!'});
  } catch (err) {
    res.status(400).json({success: false});
  }
};
