// This middleware applies the Don't Repeat Yourself or (DRY) technique. This is so as our bootcamps controllers async functions don't have to repeat the try catch all the time. Instead, they use asyncHandler once and that's it, thus using up less code and not repeating the try catch every time. In summary, this acts as a try{}catch(){} block just instead of being lengthy and clunky its used once before the async and its very minimal and nice.
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
