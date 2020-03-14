const express = require('express');
// Destructuring
const {
  deleteBootcamp,
  createBootcamp,
  updateBootcamp,
  getBootcamps,
  getBootcamp
} = require('../controllers/bootcamps');

//Express has to be called router in alternative modules (not the main one - server.js).
const router = express.Router();

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .put(updateBootcamp)
  .get(getBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
