const express = require('express');
// Destructuring
const {
  deleteBootcamp,
  createBootcamp,
  updateBootcamp,
  getBootcamps,
  getBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

//Express has to be called router in alternative modules (not the main one - server.js).
const router = express.Router();

//Anywhere this middleware is put the user will have to be logged in to the correct account to do something with the course
const {protect, authorize} = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
// Re-route into other resource routers
//The below router means that if you have the "/:bootcampId/courses" in your URL the router will route you to the courseRouter which is the courses.js file. This means that even if your URL starts with /bootcamps you can still go to the courses route. In summary, anything that goes here '/:bootcampId/courses' will go to the courseRouter
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/:id/photo')
  //put authorize middleware after protect because the user's verification is done in protect and
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
