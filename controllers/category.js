const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const createError = require('http-errors');
const Category = require('../models/category');
const Item = require('../models/item');

const { isAdmin, isAuthenticated } = require('./auth');

module.exports.index = [
  isAuthenticated,

  asyncHandler(async (req, res) => {
    res.redirect('/');
  }),
];

module.exports.createGet = [
  isAdmin,

  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 'asc' }).exec();

    res.render('category_form', {
      title: 'Create Category',
      categories,
      currentUser: req.user,
    });
  }),
];

module.exports.createPost = [
  isAdmin,

  body('name')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters long.')
    .bail()
    .escape(),
  body('description')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Description must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters long.')
    .bail()
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      const nameErr = errors.array().find((err) => err.path === 'name');
      const descriptionErr = errors
        .array()
        .find((err) => err.path === 'description');

      category.nameErrorMsg = nameErr ? nameErr.msg : '';
      category.descriptionErrorMsg = descriptionErr ? descriptionErr.msg : '';

      res.render('category_form', {
        title: 'Create Category',
        category,
      });
      return;
    }

    const savedCategory = await category.save();
    res.redirect(savedCategory.url);
  }),
];

module.exports.getItemsByCategory = [
  isAuthenticated,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [categories, items] = await Promise.all([
      Category.find().sort({ name: 'asc' }).exec(),
      Item.find({ category: req.params.id }).exec(),
    ]);

    const category = categories.find(
      (cat) => cat._id.toString() === req.params.id,
    );

    if (!category) {
      next(createError(404));
    } else {
      res.render('index', {
        title: `Inventory - ${category.name}`,
        currentUser: req.user,
        items,
        categories,
        category,
      });
    }
  }),
];

module.exports.updateGet = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const categories = await Category.find().sort({ name: 'asc' }).exec();
    const category = categories.find(
      (cat) => cat._id.toString() === req.params.id,
    );

    if (!category) {
      next(createError(404));
    } else {
      res.render('category_form', {
        title: 'Update Category',
        currentUser: req.user,
        category,
        categories,
      });
    }
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

  body('name')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters long.')
    .bail()
    .escape(),
  body('description')
    .exists()
    .trim()
    .notEmpty()
    .withMessage('Description must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters long.')
    .bail()
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const nameErr = errors.array().find((err) => err.path === 'name');
      const descriptionErr = errors
        .array()
        .find((err) => err.path === 'description');

      category.nameErrorMsg = nameErr ? nameErr.msg : '';
      category.descriptionErrorMsg = descriptionErr ? descriptionErr.msg : '';

      res.render('category_form', {
        title: 'Update Category',
        category,
      });
      return;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      category,
      {},
    );

    res.redirect(updatedCategory.url);
  }),
];

module.exports.deleteGet = [
  isAdmin,

  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    next();
  },

  asyncHandler(async (req, res, next) => {
    const categories = await Category.find().sort({ name: 'asc' }).exec();
    const category = categories.find(
      (cat) => cat._id.toString() === req.params.id,
    );

    if (!category) {
      next(createError(404));
    } else {
      res.render('category_delete', {
        title: 'Delete Category',
        currentUser: req.user,
        category,
        categories,
      });
    }
  }),
];

module.exports.deletePost = [
  isAdmin,

  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    next();
  },

  asyncHandler(async (req, res, next) => {
    const categories = Category.find().sort({ name: 'asc' }).exec();

    const category = categories.find(
      (cat) => cat._id.toString() === req.params.id,
    );

    if (!category) {
      next(createError(404));
    } else {
      const session = await Category.startSession();
      session.startTransaction();

      try {
        await Promise.all([
          Item.deleteMany({ category: req.params.id }).session(session),
          Category.findByIdAndDelete(req.params.id).session(session),
        ]);

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }

      res.redirect('/');
    }
  }),
];
