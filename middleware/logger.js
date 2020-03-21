// Logs requests to console
//We're not using it but that's how it would look.
const logger = (req, res, next) => {
  console.log(
    `${req.method}${req.protocol}://${req.get('host')}${req.originalUrl}`.red
  );
};

module.exports = logger;
