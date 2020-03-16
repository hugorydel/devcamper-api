const NodeGeocoder = require('node-geocoder');
// This code is also on the MapQuest Dev Network
const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  //This - API_KEY - links it to our account
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
