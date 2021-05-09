const jwt = require('jsonwebtoken');
var conf_sercet = require('../config/sercret.json')
const { tokenModel } = require('../models/token');
const CryptoJS = require('crypto-js');


function encrypt(value) {

  return CryptoJS.AES.encrypt(value, conf_sercet.token_sercet_key.trim()).toString();
}

function decrypt(textToDecrypt) {
  return CryptoJS.AES.decrypt(textToDecrypt, conf_sercet.token_sercet_key.trim()).toString(CryptoJS.enc.Utf8);
}


function decryptReqBody(req, res, next) {

  let msg = CryptoJS.AES.decrypt(req.body['message'], conf_sercet.token_sercet_key.trim()).toString(CryptoJS.enc.Utf8);
  req.body['message'] = msg;
  next();
}

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
exports.decryptReqBody = decryptReqBody
exports.encrypt = encrypt
exports.decrypt = decrypt
