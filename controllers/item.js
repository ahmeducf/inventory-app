const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const createError = require('http-errors');

const upload = multer({
  dest: path.join(process.cwd(), 'public/images'),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

const Item = require('../models/item');
const Category = require('../models/category');

const { isAuthenticated, isAdmin } = require('./auth');

module.exports.index = [
  isAuthenticated,

  (req, res) => {
    res.redirect('/');
  },
];

module.exports.createGet = [
  isAdmin,

  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 }).exec();

    res.render('item_form', {
      title: 'Create Item',
      categories,
    });
  }),
];

module.exports.createPost = [
  isAdmin,

  upload.single('image'),

  body('name')
    .exists()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters long')
    .bail()
    .escape(),
  body('description')
    .exists()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters long')
    .bail()
    .escape(),
  body('price')
    .exists()
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than 0')
    .bail()
    .toFloat(),
  body('quantity')
    .exists()
    .trim()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a whole number greater than or equal to 0')
    .bail()
    .toInt(),
  body('category')
    .exists()
    .trim()
    .isMongoId()
    .withMessage('Category must be a valid category')
    .bail()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
    });

    const errors = validationResult(req);

    const nameErr = errors.array().find((err) => err.path === 'name');
    const descriptionErr = errors
      .array()
      .find((err) => err.path === 'description');
    const priceErr = errors.array().find((err) => err.path === 'price');
    const quantityErr = errors.array().find((err) => err.path === 'quantity');
    const categoryErr = errors.array().find((err) => err.path === 'category');

    item.nameErrorMsg = nameErr ? nameErr.msg : '';
    item.descriptionErrorMsg = descriptionErr ? descriptionErr.msg : '';
    item.priceErrorMsg = priceErr ? priceErr.msg : '';
    item.quantityErrorMsg = quantityErr ? quantityErr.msg : '';
    item.categoryErrorMsg = categoryErr ? categoryErr.msg : '';

    if (!req.file) {
      item.imageErrorMsg = 'Image must be specified';
    } else {
      item.image = req.file.filename;
    }
    req.item = item;
    req.errors = errors;

    next();
  }),

  asyncHandler(async (req, res) => {
    if (!req.errors.isEmpty() || !req.file) {
      const categories = await Category.find().sort({ name: 1 }).exec();

      res.render('item_form', {
        title: 'Create Item',
        item: req.item,
        categories,
      });
      return;
    }

    const savedItem = await req.item.save();
    res.redirect(savedItem.url);
  }),
];

module.exports.detail = [
  isAuthenticated,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [categories, item] = await Promise.all([
      Category.find().sort({ name: 'asc' }).exec(),
      Item.findById(req.params.id).populate('category').exec(),
    ]);

    if (!item) {
      next(createError(404));
    }

    res.render('item_detail', {
      title: item.name,
      item,
      categories,
    });
  }),
];

module.exports.updateGet = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [categories, item] = await Promise.all([
      Category.find().sort({ name: 'asc' }).exec(),
      Item.findById(req.params.id).populate('category').exec(),
    ]);

    if (!item) {
      next(createError(404));
    }

    res.render('item_form', {
      title: `Update ${item.name}`,
      item,
      categories,
    });
  }),
];

module.exports.updatePost = [
  isAdmin,

  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    next();
  },

  upload.single('image'),

  body('name')
    .exists()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters long')
    .bail()
    .escape(),
  body('description')
    .exists()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters long')
    .bail()
    .escape(),
  body('price')
    .exists()
    .trim()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than 0')
    .bail()
    .toFloat(),
  body('quantity')
    .exists()
    .trim()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a whole number greater than or equal to 0')
    .bail()
    .toInt(),
  body('category')
    .exists()
    .trim()
    .isMongoId()
    .withMessage('Category must be a valid category')
    .bail()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const nameErr = errors.array().find((err) => err.path === 'name');
    const descriptionErr = errors
      .array()
      .find((err) => err.path === 'description');
    const priceErr = errors.array().find((err) => err.path === 'price');
    const quantityErr = errors.array().find((err) => err.path === 'quantity');
    const categoryErr = errors.array().find((err) => err.path === 'category');

    req.item = new Item({
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
    });

    req.item.nameErrorMsg = nameErr ? nameErr.msg : '';
    req.item.descriptionErrorMsg = descriptionErr ? descriptionErr.msg : '';
    req.item.priceErrorMsg = priceErr ? priceErr.msg : '';
    req.item.quantityErrorMsg = quantityErr ? quantityErr.msg : '';
    req.item.categoryErrorMsg = categoryErr ? categoryErr.msg : '';

    if (!req.file) {
      req.item.imageErrorMsg = 'Image must be specified';
    } else {
      req.item.image = req.file.filename;
    }

    req.errors = errors;

    next();
  }),

  asyncHandler(async (req, res) => {
    if (!req.errors.isEmpty() || !req.file) {
      const categories = await Category.find().sort({ name: 1 }).exec();

      res.render('item_form', {
        title: `Update ${req.item.name}`,
        item: req.item,
        categories,
      });
    } else {
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        req.item,
        {},
      );

      res.redirect(updatedItem.url);
    }
  }),
];

module.exports.deleteGet = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [categories, item] = await Promise.all([
      Category.find().sort({ name: 'asc' }).exec(),
      Item.findById(req.params.id).populate('category').exec(),
    ]);

    if (!item) {
      next(createError(404));
    }

    res.render('item_delete', {
      title: `Delete ${item.name}`,
      item,
      categories,
    });
  }),
];

module.exports.deletePost = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    await Item.findByIdAndRemove(req.params.id);

    res.redirect('/items');
  }),
];
