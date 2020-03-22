const express = require('express');
// Destructuring
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const User = require('../models/User');

//enabling mergeParams enables us to access the parent parameters - bootcamps.js, because it routes to courses. This means that now we can access all courses associated with a specific bootcamp. The merge parameter merges the URL's of 2 routes the bootcamps and the courses.
const router = express.Router({mergeParams: true});

//Anywhere this middleware is put the user will have to be logged in to the correct account to do something with the course
const {protect, authorize} = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

//All routes will only accept admins using authorization route and only be accesible when they're logged in using the protect route. We can do this by just making it so the routers below all use protect and authorize with the use of use()

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
