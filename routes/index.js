var express = require('express');
var router = express.Router();
const logger = require('../logger/logger.adapter')

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.log.info("request recieved")
  res.render('index', { title: 'Express' });
});

module.exports = router;
