const express = require('express')
const router = express.Router()

//importing controller
const { signup, signin, signout, requireSignin } = require('../controllers/auth')
//importing validator
const { userSignupValidator } = require('../validator/index')

router.get('/signout',  signout);

router.post('/signup', userSignupValidator, signup);
router.post('/signin',  signin);

module.exports = router;