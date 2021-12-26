var express = require('express');
var router = express.Router();
let logger = require('../logger/app.logger')


/* GET home page. */
router.get('/', function (req, res, next) {



  res.render('index', { title: "Hello Team" });
});



module.exports = router;
