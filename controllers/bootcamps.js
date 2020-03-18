const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
// Description  -- Get All Bootcamps /Get specified bootcamps
// Route        -- GET /api/v1/bootcamps
// Access       -- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //Copy request.query
  const reqQuery = {...req.query};

  //Fields that should be excluded form the sorting and selecting operations below
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //Looping over removeFields params in order to delete them from the request query - this is so as the later program doesn't get confused as to what is a desired requests to find/sort by vs. what is the initializing request (that which says whether we should sort, select, or otherwise)
  removeFields.forEach(param => delete reqQuery[param]);

  //Query from the request object is the things you want to find, specifically - does the thing I want cost x? does it have a guarantee? etc. This is written as for example {some URL}/api/bootcamps?averageCost[lte]=10000 -- the thing after the ? is the query which looks for a bootcamp with an averageCost of less than or equal to 10000.
  //Creating a query string
  let queryStr = JSON.stringify(reqQuery);
  // console.log(queryStr);
  //The above console.log should give the query which in the case xxx?averageCost[lte]=10000 should be {"averageCost": {"lte": "10000"}}
  //The X in the replace(X) represents the search Value we want (something greater than, or greater than or equal to, etc. + in searches lists). In a \b boundary \b the things inside it must form a word of their own. /g checks all instances of what we want not just the first one.
  //Creating operators such as $gt, $gte, etc.
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    /*We put the money sign in front of the matching query because only then will it be accepted as a mongoose operator thus we change simply match into...*/ match =>
      `$${match}`
  );
  // console.log(queryStr); -- should be an operator with $ in front now

  //find only accepts objects so you need to change the previously JSON text into a JS object
  // Finiding specified resource
  // When we populate the Bootcamp with the courses virtual we are adding, to each bootcamp, courses that have the same id as the bootcamp
  //when you call populate("courses") on the Bootcamp model you are referencing a virtual object which when its path is called does what it does (reference Bootcamp.js ctrlf BootcampSchema.virtual())
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
  //When we do select="whatever" and then when we find it as req.query.select the select acts as a key to value "whatever". console.log(req.query.select); should return the values of the key "select".

  //Select Fields
  //This selects the values of the key "select", splits them and then joins them with a space in between so as they fit MongoDB select syntax
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Sort Resources
  if (req.query.sort) {
    //sort is a key that you equal to some values that you then split, join and sort the whole thing in your query. BTW it does not have to be called sort but for the sake of clarity it is.
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //Pagination
  //When the limit says 100 it means at most 100 courses/bootcamps per page. When 10 is written inside of parseInt it is talking about what base the page or limit should be- base 10 in our example.Think about pagination as a google search engine - there are say 20 websites on the first page, if you want to go to the next ones you have to "skip" to pg 2 which is then multiplied by the limit, the order of the first website on the second page (21st). Lastly
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const courseIndex = (page - 1) * limit;
  const total = await Bootcamp.countDocuments();
  //The query will be skipped up to the starting index
  query = query.skip(courseIndex).limit(limit);

  //Executing the query
  const bootcamps = await query;

  //Pagination Result
  const pagination = {};

  // Both of the below statements modify the above pagination object by either giving only a next page option if its the first one or by giving only the previous page option if its the last page
  if (courseIndex + limit < total) {
    //the below object just means that if the stuff above is true the "next" property of the pagination object, previously empty above, will show the next page number.
    pagination.next = {
      page: page + 1,
      limit //The limit will just be the limit we set earlier
    };
  }

  if (courseIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
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
