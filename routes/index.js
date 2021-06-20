var express = require('express');
var router = express.Router();
let logger = require('../logger/app.logger')


/* GET home page. */
router.get('/', function(req, res, next) {
logger.log.debug("this is a debug")
  
  res.render('index', { title: 'Express' });
});

module.exports = router;
