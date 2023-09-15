const express = require('express');
const { loginGet, loginPost, logoutGet, index, profile } = require('../controllers');

const router = express.Router();

router.get('/', index);

router.get('/login', loginGet);

router.post('/login', loginPost);

router.get('/logout', logoutGet);

router.get('/profile', profile);

module.exports = router;
