const express = require('express');
const {
  index,
  createGet,
  createPost,
  getItemsByCategory,
  updateGet,
  updatePost,
  deleteGet,
  deletePost,
} = require('../controllers/category');

const router = express.Router();

router.get('/', index);

router.get('/create', createGet);

router.post('/create', createPost);

router.get('/:id', getItemsByCategory);

router.get('/:id/update', updateGet);

router.post('/:id/update', updatePost);

router.get('/:id/delete', deleteGet);

router.post('/:id/delete', deletePost);

module.exports = router;
