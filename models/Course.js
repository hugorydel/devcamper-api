const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add a duration in weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please add a minimum skill level']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  //each course knows which bootcamp it belongs to as it references the bootcamp object ID and compares it to its own ID's
  //In the data The Bootcamp object is already set to an existing object's ObjectId
  bootcamp: {
    //This gives us a inputtable (can be modified, made up word btw) object whose ObjectId we can change to one of the Bootcamp schemas Objects. It has to be the Bootcamp set object (by Mongoose) because we referenced "Bootcamp" (ref: Bootcamp) so that is what the ObjectId will accept.
    type: mongoose.Schema.ObjectId,
    //ref tells the above ObjectID what to look for
    //Schema hasn't been registered for model \"bootcamp\".\nUse mongoose.model(name, schema). Therefore we should put this reference as "Bootcamp" as that is what the model is called.
    //This refers to the Bootcamp schema and the info
    ref: 'Bootcamp',
    //Every course needs to have a bootcamp referenced
    required: true
  }
});

module.exports = mongoose.model('Course', CourseSchema);
