const express = require('express');
const {
  index,
  createGet,
  createPost,
  detail,
  deleteGet,
  deletePost,
  updateGet,
  updatePost,
} = require('../controllers/user');

const router = express.Router();

router.get('/', index);

router.get('/create', createGet);

router.post('/create', createPost);

router.get('/:id', detail);

router.get('/:id/update', updateGet);

router.post('/:id/update', updatePost);

router.get('/:id/delete', deleteGet);

router.post('/:id/delete', deletePost);

module.exports = router;
