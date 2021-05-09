const jwt = require('jsonwebtoken');
var conf_sercet = require('../config/sercret.json')
const { tokenModel } = require('../models/token');



function authToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null || token == undefined) return res.sendStatus(401);
  jwt.verify(token, conf_sercet.token_sercet_key, (err, data) => {
    if (err) return res.sendStatus(401);
    next()
  })
}


exports.securedWithToken = authToken