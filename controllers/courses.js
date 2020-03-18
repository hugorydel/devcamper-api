const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');

// Description  -- Get All Courses
// Route        -- GET /api/v1/courses
// Description  -- Get Courses for Bootcamp
// Route        -- GET /api/v1/bootcamps/:bootcampId/courses
// Access       -- Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  // The below if statement finds specific courses corresponding to the bootcampId (belonging to the bootcamp).
  if (req.params.bootcampId) {
    //Finds specific course
    //Returns a promise
    query = Course.find({bootcamp: req.params.bootcampId});
  }
  // The below else is the "get all courses" option
  else {
    //Finds all courses
    //The populate works to give us the whole object with the given ID because in our course model we've defined that the bootcamp object has a type mongoose.Schema.Types.Object referencing the model Bootcamp (with the usage of ref: Bootcamp). This means that when we call populate the bootcamp object we are actually calling the data of the Bootcamp with the given ID (the ID that corresponds to the course). In summary, the populate calls the specific courses' "bootcamp" object which then, because it has a mongoose.Schema.ObjectId corresponding to some Bootcamp Id, goes to the database and takes the Bootcamp with the given -ObjectId. It knows which model to take because we've ref(renced) it using the path: "bootcamp". Finally, when the refferenced model's bootcamp is found it is then put in the bootcamp object (bootcamp: data).
    //Its actually that the bootcamp path already has the id to the corresponding Bootcamp and we're just calling that bootcamp which then references the Bootcamp with the given ID. Only then are we selecting only the Bootcamp's name and description - otherwise the whole Bootcamp would've been selected
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }
  const courses = await query;

  //We put await here because we are awaiting for the bootcamp promise to actually be fulfilled or its null alternative -all courses given- to be set.
  //This is a different way to the one above (beggining with let query; and ending with const courses = await query;) it however doesn't work with more complex parts such as the .populate()

  // const courses = await Course.find(
  //   req.params.bootcampId ? {bootcamp: req.params.bootcampId} : null
  // );

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
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
  //The bootcampId has to already be a viable bootcampId, or error, so when we equal it to the bootcamp object (originating from the Course). When our :bootcampId gets submitted into the Course model it will reference a bootcamp with the same id as our course. mongoose.Schema.ObjectId in the course is replaced by the req.params.bootcampId. Because a bootcamp path is required setting this is important (assuming that you won't put that in as an object)
  req.body.bootcamp = req.params.bootcampId;

  //We have the bootcamp variable here purely because we need to verify that there is in fact a bootcamp that corresponds to the id we input
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `The bootcamp with the id ${req.params.id} does not exist`,
        404
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
  let course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id ${req.params.id} exists`, 404)
    );
  }

  course = res.status(200).json({
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

  await course.remove();

  res.status(200).json({
    success: true,
    data: 'Course successfully deleted'
  });
});
