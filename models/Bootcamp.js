const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
  {
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
        'Please Use A Valid URL'
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
        //https://docs.mongodb.com/manual/core/2dsphere/
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
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
    },
    user: {
      //Associates user with a bootcamp
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  //This is required to create a reverse populate object
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

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

// Cascade Delete Courses when a bootcamp is deleted.
// _id is the id of both the main bootcamp and the courses corresponding to it so asking for bootcamp.remove(some bootcamp) in the controllers will remove the bootcamp (like the deleteBootcamp function should) and then it will go down here and also "remove" - as that is what its listening to - the courses with the same id.
//Remember to put a normal function here because arrow functions have a different this syntax (you can notice the changes (when hovering over _id) if you change from an arrow to a normal function). The this._id should refer to this document's id instead of refering to "any"thing. Also remember that _id when talking about models in mongoose refers to the ObjectId. "this" seems to stand for the Mongoose Document (which contains a model "Course" and the course itself contains a bootcamp object with some data)
BootcampSchema.pre('remove', async function(next) {
  console.log(`Courses being removed from bootcamp ${this._id}`);
  // console.log(this); Returns bootcamp with id of _id
  //Document contains everything including models such as the course. This console returns Model { Course }
  // console.log(this.model('Course'));
  //If it is not specified what courses should be deleted (the deletedMany() is empty) then all courses will be deleted. This._id refers to the id of the Bootcamp model
  //.this refers to the Query which cointains the course model. The other this refers to the course model itself - console.log(this.model('Course').deleteMany({bootcamp: this._id})); says more on this.
  await this.model('Course').deleteMany({bootcamp: this._id});

  next();
});

//Reverse populate with virtuals
//mind that the first value in virtual does not have to be courses but it makes sense to call it that as we want courses to be input into the virtual values

BootcampSchema.virtual('courses', {
  //References the Course model which has 9 course objects
  ref: 'Course',
  //Takes id from the local file aka Bootcamp.js e.g. Id of course x = 3 and then we match it with the foreign field's information i.e. the ObjectId from the Course.
  //This field (_id) is taken from each of the Bootcamp objects. Then it is matched to the foreign field
  //Where bootcamp id
  localField: '_id',
  //Takes the bootcamp stuff e.g(Course: {more stuff..., "bootcamp": "5d725a1b7b292f5f8ceff788"}) and matches it to the local field: _id and then puts equivalent things in the virtual schema on the bottom of Bootcamp.
  //Is equal to the course id
  foreignField: 'bootcamp',
  justOne: false
  //Gives you an array of all the courses for each bootcamp as it matches the _id to the id of the course
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
