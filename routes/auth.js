const express = require('express');
const {register, login, getMe} = require('../controllers/auth');

const router = express.Router();

const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
//This get request requires protect middleware because upon execution that middleware leaves a req.user variable which has an id we need to have
router.get('/me', protect, getMe);

module.exports = router;
