const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Invalid Email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    //Specifies default path selection behavior. In other words, you can specify if this path should be included or excluded from query results by default. It does not show you the password in the database by default, basically.
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Encrypt password using bcryptjs (we name it bycrypt though)

UserSchema.pre('save', async function(next) {
  //genSalt jumbles up password so as its undicernable
  const salt = await bcrypt.genSalt(10);
  //We have access to this.password (user.password) because before saving the UserSchema there is a query which has all the User.create details (from auth.js) as the password. Thus, we can access the user's password then. lecture 46
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT - a json web token - and return it. More info on this page https://github.com/auth0/node-jsonwebtoken
UserSchema.methods.getSignedJwtToken = function() {
  //because this is a method and not a part of the schema we have access to the already existing user thus we can use this._id which gives us the mongo created User object id.
  //if you don't put in return in functions/methods nothing gets returned
  return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

//Match user entered password to hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  //.this usage lecture 48
  //This method is called on the existing user object and so this.password refers to the hashed password of the existing user.
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
