var express = require('express');
var router = express.Router();
let logger = require('../logger/app.logger')
let { tlv_encoder } = require('../securitylayer/tlv.encoder')

/* GET home page. */
router.get('/', function (req, res, next) {



  res.render('index', { title: "Middleware app" });
});


// post to encrypt

router.post('/encyprtdata', function (req, res, next) {
  try {
    let response = tlv_encoder(req, res, next);
    logger.log.info(`${JSON.stringify(req.body)}  - 200 - ok`);
    res.send(response);
    
  } catch (error) {
    logger.log.info(req.body);
    logger.log.error(error);
  }
});
module.exports = router;
