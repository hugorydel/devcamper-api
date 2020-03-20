// required to verify our token
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
// If not authorized returns error otherwise does nothing letting you move on
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Bearer token -> [0: Bearer, 1: token] -> token
    token = req.headers.authorization.split(' ')[1];
  }
  //    else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  // console.log(token);

  //Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse('Not Authorized to access this content', 401)
    );
  }

  try {
    //Verify token
    //The secret has to be the same secret with which the registration created the user. A decoded token with actual data is returned
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Whatever user is currently being decoded/logged in/registered is the req user
    req.user = await User.findById(decoded.id);
    console.log(req.user);
    next();
  } catch (err) {
    return next(
      new ErrorResponse('Not Authorized to access this content', 401)
    );
  }
});

// Grant access based on specific roles. This is further sorting from the previous method. Whereas, the previous method simply checked if you're an actual user this one also checks what role you have as a User either user, publisher, admin and based on that determines what you can do. The ...roles should, in the routes, be set as the publisher and admin as they are the only ones who should be able to do more.
exports.authorize = (...roles) => {
  return (req, res, next) => {
    //Each user has a role property
    if (!roles.includes(req.user.role)) {
      return new ErrorResponse(
        `Role ${req.user.role} is not authorized to access this route`,
        //403 is a "forbidden" error
        403
      );
    }
    next();
  };
};
