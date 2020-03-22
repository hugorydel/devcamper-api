const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for your review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text input']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: true
  }
});

//Static method to get an average rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  //this. =  stands for the ReviewSchema
  const obj = await this.aggregate([
    //This match means that all reviews that have a bootcamp object with a bootcampId of x (specify) will be selected.
    {
      $match: {bootcamp: bootcampId}
    },
    //All of the reviews are now grouped by their bootcamp id (which, as previously established is already the same) and then their ratings are averaged.
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {$avg: '$rating'}
      }
    }
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: Math.round(obj[0].averageRating * 10) / 10
    });
  } catch (err) {
    console.error(err);
  }
  // Returns average cost as an array in the console - console.log(obj);
};

//Call getAverageRating after saving any review
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageRating before removing a review
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

//Makes it so as you can only add, with the usage of the ReviewSchema, one review per bootcamp as a user.
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true});

module.exports = mongoose.model('Review', ReviewSchema);
