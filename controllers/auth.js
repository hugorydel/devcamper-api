const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

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

// Description  -- Get Current logged in user
// Route        -- POST /api/v1/auth/me
// Access       -- Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({success: true, data: user});
});

// Description  -- Update user details
// Route        -- PUT /api/v1/auth/updatedetails
// Access       -- Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
  res.status(200).json({success: true, data: user});
});

// Description  -- Update password
// Route        -- PUT /api/v1/auth/updatepassword
// Access       -- Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //Check if given password matches user's password
  //You can enable asynchronous functions in if statements by putting brackets around them
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save(user, 200, res);

  //For the updatePassword to be functional (don't have to login again) you should send this at it immediately returns a valid token that enables you to do thing.
  sendTokenResponse();
});

// Description  -- Forgot password
// Route        -- POST /api/v1/auth/forgotpassword
// Access       -- Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email});

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  //Get reset token
  //Because we have a method inside the user we can simply call the getResetPasswordToken
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave: false});
  // console.log(resetToken);

  //Create reset url (basically directs to website that enables you to create a new password)
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // the \n are line breaks
  const message = `Reset your password.\n Make a PUT request to: \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Reset Token`,
      message
    });

    res.status(200).json({success: true, data: 'Email Sent'});
  } catch (error) {
    console.log(err);
    user.ResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave: false});

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// Description  -- Reset password
// Route        -- PUT /api/v1/auth/resetpassword:resettoken
// Access       -- Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    //The below checks if the expiry date of the token is greater than the current date. If so, goes to the if statement and stops the reset process
    resetPasswordExpire: {$gt: Date.now()}
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  //Set the new password and eliminate the token and expire keys as they're no longer necessary
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  //This time we save with the password validation set to true by default, hashing and all.
  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  //Create token for already initialized user.
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    //Increases safety of cookie. Isn't accesible by user.
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
