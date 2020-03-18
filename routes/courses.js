const express = require('express');
// Destructuring
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

//enabling mergeParams enables us to access the parent parameters - bootcamps.js, because it routes to courses. This means that now we can access all courses associated with a specific bootcamp. The merge parameter merges the URL's of 2 routes the bootcamps and the courses.
const router = express.Router({mergeParams: true});

router
  .route('/')
  .get(getCourses)
  //The post is on this route because we directed it here using hte bootcamps route and so it already has /:bootcampId/courses in its URL when it arrives at the point of being able to be called back.
  .post(addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;
