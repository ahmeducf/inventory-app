const express = require('express');
const { loginGet, loginPost, logoutPost } = require('../controllers');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/login', loginGet);

router.post('/login', loginPost);

router.post('/logout', logoutPost);

router.get('/profile', (req, res, next) => {
  res.send('Not implemented');
});

module.exports = router;
