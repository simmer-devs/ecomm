const express = require('express')
const router = express.Router()

//importing controller
const { userById } = require('../controllers/user')
const { create, productById, read, remove, update, list, listRelated, listCategories, listBySearch, photo } = require('../controllers/product')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

router.param('userId', userById)
router.param('productId', productById)


router.get('/products', list)
router.get('/product/:productId', read)
router.get('/products/related/:productId', listRelated)
router.get('/products/categories', listCategories)
router.get('/product/photo/:productId', photo)

router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);
router.post('/products/by/search', listBySearch)

router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);

router.delete('/product/delete/:productId/:userId', requireSignin, isAuth, isAdmin, remove);


module.exports = router;