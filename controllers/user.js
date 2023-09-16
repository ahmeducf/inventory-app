const mongoose = require('mongoose');
const createError = require('http-errors');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const { isAuthenticated, isAdmin } = require('./auth');

const User = require('../models/user');
const Category = require('../models/category');

module.exports.index = [
  isAuthenticated,

  asyncHandler(async (req, res) => {
    const [users, categories] = await Promise.all([
      User.find().sort('name.firstName'),
      Category.find().sort({ name: 1 }),
    ]);

    res.render('user_list', { title: 'Users', users, categories });
  }),
];

module.exports.createGet = [
  isAdmin,

  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });

    res.render('user_form', { title: 'Create User', categories });
  }),
];

module.exports.createPost = [
  isAdmin,

  body('username')
    .exists()
    .trim()
    .withMessage('Username must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters long.')
    .bail()
    .custom(async (username) => {
      try {
        const user = await User.findOne({ username });

        if (user) {
          throw new Error('This username is already taken.');
        }
      } catch (error) {
        throw new Error(error);
      }
    })
    .withMessage('This username is already taken.')
    .escape(),
  body('password')
    .exists()
    .trim()
    .withMessage('Password must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Password must be between 3 and 1000 characters long.')
    .escape(),
  body('confirmPassword')
    .exists()
    .trim()
    .withMessage('Confirm password must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Confirm password must be between 3 and 1000 characters long.')
    .bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Confirm password does not match password.');
      } else {
        return true;
      }
    })
    .withMessage('Confirm password does not match password.')
    .escape(),
  body('email')
    .exists()
    .trim()
    .withMessage('Email must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Email must be between 3 and 1000 characters long.')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .escape(),
  body('isAdmin')
    .optional()
    .default(false)
    .isBoolean()
    .withMessage('isAdmin must be a boolean value.')
    .escape(),
  body('firstName')
    .exists()
    .trim()
    .withMessage('First name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('First name must be between 3 and 100 characters long.')
    .escape(),
  body('familyName')
    .exists()
    .trim()
    .withMessage('Family name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Family name must be between 3 and 100 characters long.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 10),
      email: req.body.email,
      isAdmin: req.body.isAdmin,
      name: {
        firstName: req.body.firstName,
        familyName: req.body.familyName,
      },
    });

    if (!errors.isEmpty()) {
      const categories = await Category.find().sort({ name: 1 });

      const usernameErr = errors.array().find((err) => err.path === 'username');
      const passwordErr = errors.array().find((err) => err.path === 'password');
      const confirmPasswordErr = errors
        .array()
        .find((err) => err.path === 'confirmPassword');
      const emailErr = errors.array().find((err) => err.path === 'email');
      const isAdminErr = errors.array().find((err) => err.path === 'isAdmin');
      const firstNameErr = errors
        .array()
        .find((err) => err.path === 'firstName');
      const familyNameErr = errors
        .array()
        .find((err) => err.path === 'familyName');

      user.usernameErrMsg = usernameErr ? usernameErr.msg : '';
      user.passwordErrMsg = passwordErr ? passwordErr.msg : '';
      user.confirmPasswordErrMsg = confirmPasswordErr
        ? confirmPasswordErr.msg
        : '';
      user.emailErrMsg = emailErr ? emailErr.msg : '';
      user.isAdminErrMsg = isAdminErr ? isAdminErr.msg : '';
      user.firstNameErrMsg = firstNameErr ? firstNameErr.msg : '';
      user.familyNameErrMsg = familyNameErr ? familyNameErr.msg : '';

      res.render('user_form', { title: 'Create User', user, categories });
    } else {
      await user.save();
      res.redirect(user.url);
    }
  }),
];

module.exports.detail = [
  (req, res, next) => {
    if (req.params.id === req.user._id.toString()) {
      res.redirect('/profile');
    } else {
      next();
    }
  },

  isAuthenticated,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [user, categories] = await Promise.all([
      User.findById(req.params.id),
      Category.find().sort({ name: 1 }),
    ]);

    if (!user) {
      next(createError(404));
    } else {
      res.render('user_detail', { title: 'User Detail', user, categories });
    }
  }),
];

module.exports.updateGet = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [user, categories] = await Promise.all([
      User.findById(req.params.id),
      Category.find().sort({ name: 1 }),
    ]);

    if (!user) {
      next(createError(404));
    } else {
      res.render('user_form', { title: 'Update User', user, categories });
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

  body('username')
    .exists()
    .trim()
    .withMessage('Username must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters long.')
    .bail()
    .custom(async (username) => {
      try {
        const user = await User.findOne({ username });
        if (user && user.username !== username) {
          throw new Error('This username is already taken.');
        }
      } catch (error) {
        throw new Error(error);
      }
    })
    .withMessage('This username is already taken.')
    .escape(),
  body('password')
    .exists()
    .trim()
    .withMessage('Password must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Password must be between 3 and 1000 characters long.')
    .escape(),
  body('confirmPassword')
    .exists()
    .trim()
    .withMessage('Confirm password must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Confirm password must be between 3 and 1000 characters long.')
    .bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Confirm password does not match password.');
      } else {
        return true;
      }
    })
    .withMessage('Confirm password does not match password.')
    .escape(),
  body('email')
    .exists()
    .trim()
    .withMessage('Email must be specified.')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Email must be between 3 and 1000 characters long.')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .escape(),
  body('isAdmin').optional().default(false).escape(),
  body('firstName')
    .exists()
    .trim()
    .withMessage('First name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('First name must be between 3 and 100 characters long.')
    .escape(),
  body('familyName')
    .exists()
    .trim()
    .withMessage('Family name must be specified.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Family name must be between 3 and 100 characters long.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const user = new User({
      _id: req.params.id,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      isAdmin: !!req.body.isAdmin,
      name: {
        firstName: req.body.firstName,
        familyName: req.body.familyName,
      },
    });

    if (!errors.isEmpty()) {
      const categories = await Category.find().sort({ name: 1 });

      const usernameErr = errors.array().find((err) => err.path === 'username');
      const passwordErr = errors.array().find((err) => err.path === 'password');
      const confirmPasswordErr = errors
        .array()
        .find((err) => err.path === 'confirmPassword');
      const emailErr = errors.array().find((err) => err.path === 'email');
      const isAdminErr = errors.array().find((err) => err.path === 'isAdmin');
      const firstNameErr = errors
        .array()
        .find((err) => err.path === 'firstName');
      const familyNameErr = errors
        .array()
        .find((err) => err.path === 'familyName');

      user.usernameErrMsg = usernameErr ? usernameErr.msg : '';
      user.passwordErrMsg = passwordErr ? passwordErr.msg : '';
      user.confirmPasswordErrMsg = confirmPasswordErr
        ? confirmPasswordErr.msg
        : '';
      user.confirmPasswordErrMsg = confirmPasswordErr
        ? confirmPasswordErr.msg
        : '';
      user.emailErrMsg = emailErr ? emailErr.msg : '';
      user.isAdminErrMsg = isAdminErr ? isAdminErr.msg : '';
      user.firstNameErrMsg = firstNameErr ? firstNameErr.msg : '';
      user.familyNameErrMsg = familyNameErr ? familyNameErr.msg : '';

      res.render('user_form', { title: 'Update User', user, categories });
    } else {
      await User.findByIdAndUpdate(req.params.id, user);
      res.redirect(user.url);
    }
  }),
];

module.exports.deleteGet = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const [user, categories] = await Promise.all([
      User.findById(req.params.id),
      Category.find().sort({ name: 1 }),
    ]);

    if (!user) {
      next(createError(404));
    } else if (user._id.toString() === req.user._id.toString()) {
      res.redirect('/profile');
    } else {
      res.render('user_delete', { title: 'Delete User', user, categories });
    }
  }),
];

module.exports.deletePost = [
  isAdmin,

  asyncHandler(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      next(createError(404));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      next(createError(404));
    } else if (user._id.toString() === req.user._id.toString()) {
      res.redirect('/profile');
    } else {
      await user.remove();
      res.redirect('/users');
    }
  }),
];
