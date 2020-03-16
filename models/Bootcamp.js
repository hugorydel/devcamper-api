const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Add A Bootcamp Name'],
    //No 2 Bootcamps can have the same name
    unique: true,
    //It'll trim all unused spaces
    trim: true,
    maxlength: [50, "Name Can't Be More Than 50 Characters Long"]
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Description Required'],
    trim: true,
    maxlength: [500, "Description Can't Be More Than 500 Characters Long"]
  },
  website: {
    type: String,
    match: [
      //From Stack Overflow https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript, makes sure that the URL starts with HTTP/HTTPS and is a valid URL Overall.
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please Use A Valid URL With HTTP or HTTPS'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone Number Cannot Be Longer Than 20 Characters']
  },
  email: {
    type: String,
    match: [
      //From Stack Overflow https://stackoverflow.com/questions/201323/how-to-validate-an-email-address-using-a-regular-expression, makes sure that email address is correct
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Invalid Email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Add An Address']
  },
  location: {
    //GeoJSON Point goes into what this does further
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    formattedAddress: String,
    formattedAddress: String
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating Must Be At Least 1'],
    max: [10, 'Rating Can Be At Most 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create bootcamp slug from the name
// .pre() - runs before the document (BootcampSchema) is saved
// The below is a middleware function as it happens in the "middle" of the API process (isn't the first thing to happen or last)
BootcampSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  // The next is used so as to move to the next piece of middleware
  next();
});

//The below middleware also comes from geocoder website

BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    // We use the loc[0] because the geocoder.geocode is an Array with 2 parts the first one being all the address info we need (that's why we want the first part or loc[0])
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  //Don't save address in MongoDatabase because we already process it above by way of the formattedAddress. How to do so below.
  this.address = undefined;
  next();
});
//Geocode & Create Location Field

module.exports = mongoose.model('Bootcamp', BootcampSchema);
