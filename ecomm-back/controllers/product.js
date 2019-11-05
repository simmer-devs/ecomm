const Product = require('../models/product')
const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')
const { errorHandler } = require("../helpers/dbErrorHandler")

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product){
            return res.status(400).json({
                error: 'Product not found.'
            })
        }
        req.product = product;
        next();
    })
} 

exports.read = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product)
}

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error: 'Image could not be uploaded.'
            })
        }

        //check for all fields
        const { name, description, price, category, quantity, shipping } = fields
        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error: 'All fields are required.'
            })
        }

        let product = new Product(fields)

        //1kb = 1000
        //1mb = 1 000 000

        if(files.photo) {
            if(files.photo.size > 1000000) {
                return res.status(400).json({ 
                    error: 'Image must be less than 1mb.'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        })
    })
}

exports.remove = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            }) 
        }
        res.json({
            message: 'Product successfully deleted.'
        })
    })
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error: 'Image could not be uploaded.'
            })
        }

        //check for all fields
        const { name, description, price, category, quantity, shipping } = fields
        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error: 'All fields are required.'
            })
        }

        let product = req.product
        product = _.extend(product, fields)

        //1kb = 1000
        //1mb = 1 000 000

        if(files.photo) {
            if(files.photo.size > 1000000) {
                return res.status(400).json({ 
                    error: 'Image must be less than 1mb.'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        })
    })
}

//most sales and new arrivals
//by sell = '/products?sortBy=sold&order=desc&limit=4'
//by arrival = '/products?sortBy=createdAt&order=desc&limit=4'
//if no params sent, all products returned

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if(err){
                return res.status(400).json({
                    error: 'Products not found.'
                })
            }
            res.json(products)
        })
}

//find the products based on the req product category 
//other products in the same category will be returned

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find({_id: { $ne: req.product }, category: req.product.category})
        .limit(limit)
        .populate('category', '_id name')
        .exec((err, products) => {
            if(err) {
                return res.status(400).json({
                    error: 'Products not found.'
                });
            }
            res.json(products);
        })
};

exports.listCategories = (req, res) => {
    Product.distinct('category', {}, (err, categories) => {
        if(err){
            res.status(400).json({
                error: 'Categories not found'
            })
        }
        res.json(categories)
    })
};

exports.listBySearch = (req, res) => {
    console.log(req)
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};


    for (let key in req.body.filters) {
        if(req.body.filters[key].length > 0){
            if(key === 'price'){
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            }
            else{
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if(err){
                return res.status(400).json({
                    error: 'Products not found.'
                });
            }
            res.json({
                size: data.length,
                data
            })
        })
};

exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}