const asyncHandler = require('express-async-handler');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

module.exports.loginGet = [
  (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect('/');
    } else {
      next();
    }
  },

  (req, res, next) => {
    if (req.session.messages && req.session.messages.length > 0) {
      const lastMsg = req.session.messages.pop();
      if (lastMsg === 'username') {
        req.session.usernameErrMsg = 'Incorrect username';
        req.session.passwordErrMsg = '';
      } else if (lastMsg === 'password') {
        req.session.usernameErrMsg = '';
        req.session.passwordErrMsg = 'Incorrect password';
      }
    }

    next();
  },

  (req, res) => {
    const usernameErr = req.session.usernameErrMsg;
    const passwordErr = req.session.passwordErrMsg;
    req.session.usernameErrMsg = '';
    req.session.passwordErrMsg = '';

    res.render('login', {
      title: 'Login',
      usernameErrMsg: usernameErr,
      passwordErrMsg: passwordErr,
    });
  },
];

module.exports.loginPost = [
  body('username')
    .exists()
    .withMessage('Username is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters long')
    .bail()
    .escape(),
  body('password')
    .exists()
    .withMessage('Password is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Password must be between 3 and 1000 characters long')
    .bail()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const usernameErr = errors.array().find((err) => err.path === 'username');
      req.session.usernameErrMsg = usernameErr ? usernameErr.msg : '';
      const passwordErr = errors.array().find((err) => err.path === 'password');
      req.session.passwordErrMsg = passwordErr ? passwordErr.msg : '';
      res.redirect('/login');
    } else {
      next();
    }
  }),

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true,
  }),
];

module.exports.logoutPost = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      res.redirect('/login');
    }
  });
};
