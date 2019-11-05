const express = require('express')
const router = express.Router()

//importing controller
const { userById, read, update } = require('../controllers/user')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

//get the user by ID and pass into the get request, checks if the users token matches the user whose id is in the url, can also check admin
router.param('userId', userById);

router.get('/user/:userId', requireSignin, isAuth, read)
router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    });
});

router.put('/user/:userId', requireSignin, isAuth, update)

module.exports = router;