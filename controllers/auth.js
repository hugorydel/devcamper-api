const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// Description  -- Register User
// Route        -- POST /api/v1/auth/register
// Access       -- Public

exports.register = asyncHandler(async (req, res, next) => {
  const {name, email, password, role} = req.body;

  const emailExists = await User.findOne({email});
  //email already exists error
  if (emailExists) {
    return next(new ErrorResponse(`Email ${email} unavailable`, 403));
  }
  // Create a user
  //We use await here because it takes time for the User model to be found by mongodb and then created with the stuff we want
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// Description  -- Login User
// Route        -- POST /api/v1/auth/login
// Access       -- Public

exports.login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;

  // Validate email and password

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //Check for user
  //.select(+password) means that you have to include both the username and the password to be logged in.
  const user = await User.findOne({email}).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  //Check if password matches (its a promise thus await)
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
  //Create token for already initialized user.
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  //Makes the cookie a safer version of HTTP during production/deployment (HTTPS)

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({success: true, token});
};

// Description  -- Get Current logged in user
// Route        -- POST /api/v1/auth/me
// Access       -- Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({success: true, data: user});
});
