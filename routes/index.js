const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/login', (req, res, next) => {
  res.send('Not implemented');
});

router.post('/login', (req, res, next) => {
  res.send('Not implemented');
});

router.post('/logout', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/profile', (req, res, next) => {
  res.send('Not implemented');
});

module.exports = router;
