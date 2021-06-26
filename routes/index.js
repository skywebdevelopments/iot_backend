var express = require('express');
var router = express.Router();
let logger = require('../logger/app.logger')
let { tlv_encoder } = require('../securitylayer/tlv.encoder')

/* GET home page. */
router.get('/', function (req, res, next) {

  logger.log.trace(req.body);

  res.render('index', { title: 'جهاز المخابرات العامه' ,subtitle:"اداره امن المعلومات"});
});


// post to encrypt

router.post('/encyprtdata', function (req, res, next) {
  let response =tlv_encoder(req,res,next);
  console.log(response);
  res.send(response);
});
module.exports = router;
