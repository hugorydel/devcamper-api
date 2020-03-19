const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// Description  -- Register Useer
// Route        -- GET /api/v1/auth/register
// Access       -- Public

exports.register = asyncHandler(async (req, res, next) => {
  res.status(200).json({success: true});
});
