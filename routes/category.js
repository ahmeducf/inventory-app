const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/create', (req, res, next) => {
  res.send('Not implemented');
});

router.post('/create', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/:id', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/:id/update', (req, res, next) => {
  res.send('Not implemented');
});

router.post('/:id/update', (req, res, next) => {
  res.send('Not implemented');
});

router.get('/:id/delete', (req, res, next) => {
  res.send('Not implemented');
});

router.post('/:id/delete', (req, res, next) => {
  res.send('Not implemented');
});

module.exports = router;
