const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// Description  -- Get All Courses
// Route        -- GET /api/v1/courses
// Description  -- Get Courses for Bootcamp
// Route        -- GET /api/v1/bootcamps/:bootcampId/courses
// Access       -- Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // The below if statement finds specific courses corresponding to the bootcampId (belonging to the bootcamp).
  if (req.params.bootcampId) {
    //Finds specific course
    //Returns a promise
    const courses = await Course.find({bootcamp: req.params.bootcampId});
    return res
      .status(200)
      .json({success: true, count: courses.length, data: courses});
  }
  // The below else is the "get all courses" option
  else {
    res.status(200).json(res.advancedResults);
  }
});

// Description  -- Get single Courses
// Route        -- GET /api/v1/courses/:id
// Access       -- Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// Description  -- Add Course to a specific bootcamp
// Route        -- POST /api/v1/bootcamps/:bootcampId/courses
// Access       -- Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  //The bootcampId has to already be a viable bootcampId, or error, so when we equal it to the bootcamp object (originating from the Course collection). When our :bootcampId gets submitted into the Course model it will reference a bootcamp with the same id as our course. mongoose.Schema.ObjectId in the course is replaced by the req.params.bootcampId. Because a bootcamp path is required setting this is important (assuming that you won't put that in as an object).
  //When we do this we set the bootcamp which we're referencing
  req.body.bootcamp = req.params.bootcampId;
  //Req.user.id already exists in the query after we've logged in. Here, we're setting it equal to the current model's ObjectId, originating from the Course collection.
  //Here we're setting the user which the course will reference and be able to be edit by
  req.body.user = req.user.id;

  //We have the bootcamp variable here purely because we need to verify that there is in fact a bootcamp that corresponds to the id we input
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The bootcamp with the id ${req.params.bootcampId} does not exist`,
        404
      )
    );
  }

  //To make sure the owner of the bootcamp is the person who is requesting adding a course to the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }
  //The body of our request is then put in to create a course
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

// Description  -- UPDATE Course
// Route        -- PUT /api/v1/courses/:id
// Access       -- Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id} exists`, 404)
    );
  }

  //Course owner is making request?
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// Description  -- Delete Course
// Route        -- DELETE /api/v1/courses/:id
// Access       -- Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id} exists`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`
      ),
      401
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: 'Course successfully deleted'
  });
});
