const express = require('express');
// Destructuring
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

//enabling mergeParams enables us to access the parent parameters - bootcamps.js, because it routes to courses. This means that now we can access all courses associated with a specific bootcamp. The merge parameter merges the URL's of 2 routes the bootcamps and the courses.
const router = express.Router({mergeParams: true});

//Anywhere this middleware is put the user will have to be logged in to the correct account to do something with the course
const {protect, authorize} = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  //The post is on this route because we directed it here using hte bootcamps route and so it already has /:bootcampId/courses in its URL when it arrives at the point of being able to be called back.
  .post(protect, authorize('publisher', 'admin'), addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
