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
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const courseRouter = require('./courses');

//Express has to be called router in alternative modules (not the main one - server.js).
const router = express.Router();

// Re-route into other resource routers
//The below router means that if you have the "/:bootcampId/courses" in your URL the router will route you to the courseRouter which is the courses.js file. This means that even if your URL starts with /bootcamps you can still go to the courses route. In summary, anything that goes here '/:bootcampId/courses' will go to the courseRouter
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .put(updateBootcamp)
  .get(getBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
