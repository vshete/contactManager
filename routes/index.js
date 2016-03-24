var express = require('express');
var router = express.Router();
var index = require('../controllers/index');

// var passport = require('passport');

router.get('/', index.index);

module.exports = router;
