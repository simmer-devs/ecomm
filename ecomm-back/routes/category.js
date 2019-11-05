const express = require('express')
const router = express.Router()

//importing controller
const { userById } = require('../controllers/user')
const { create, categoryById, read, update, remove, list } = require('../controllers/category')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

router.param('categoryId', categoryById)
router.param('userId', userById)

router.get('/categories', list);
router.get('/category/:categoryId', read);

router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);

router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);

router.delete('/category/delete/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);


module.exports = router;