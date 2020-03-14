const mongoose = require('mongoose');

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
      //From Stack Overflow https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript, makes sure that the URL starts with HTTP/HTTPS
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
      //From Stack Overflow https://stackoverflow.com/questions/201323/how-to-validate-an-email-address-using-a-regular-expression, makes sure that email adress is correct
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Invalid Email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Add An Adress']
  },
  //   location: {
  //     //GeoJSON Point goes into what this does further
  //     type: {
  //       type: String,
  //       enum: ['Point'],
  //       required: true
  //     },
  //     coordinates: {
  //       type: [Number],
  //       required: true,
  //       index: '2dsphere'
  //     },
  //     formattedAddress: String,
  //     street: String,
  //     city: String,
  //     state: String,
  //     zipcode: String,
  //     country: String,
  //     formattedAddress: String,
  //     formattedAddress: String
  //   },
  //   careers: {
  //     type: [String],
  //     required: true,
  //     enum: [
  //       'Web Development',
  //       'Mobile Development',
  //       'UI/UX',
  //       'Data Science',
  //       'Business',
  //       'Other'
  //     ]
  //   },
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

module.exports = mongoose.model('Bootcamp', BootcampSchema);
