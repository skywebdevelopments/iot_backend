var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { securedWithToken } = require('../secured/auth')
let { tokenModel } = require('../models/token');
let { userModel } = require('../models/user');
let jwt = require('jsonwebtoken');
let { response, request } = require('express');
let { Op, json } = require("sequelize");
var router = express.Router();



// get user token (login)
router.post('/auth', function (req, res, next) {

  

  let username = req.body.user_email;
  let password = req.body.user_password;

  userModel.findAll({
    where: {
      [Op.and]: [
        { user_email: username },
        { user_password: password }
      ]
    },
  }).then((data) => {

    //login info not found
    if (data.length === 0) return res.send(response = "invalid login information", status = 401);
    //

    //user found
    let userPayload = { name: username };
    let accessToken = jwt.sign(userPayload, conf_sercet.token_sercet_key, { expiresIn: conf_sercet.token_expiry_duration })
    //
    //store token for reference.
    tokenModel.create({ user_email: username, token_key: accessToken }).then((data) => {
      if (data) res.send(response = { accessToken: accessToken }, status = 200);
      else res.send(response = "error caching the token key.", status = 401);
    }).catch((err) => {
      next(err);
    });

    //end

  });


});

// accepts user_email , user_password , user_role
router.post('/create', securedWithToken, (req, res, next) => {

  userModel.create(req.body).then((data) => {

    if (data) return res.send(response = "user was created", status = 200);
    res.send(`${data}`, status = 400);
  }).catch((err) => {

    return res.send(response = err.parent.sqlMessage, status = 500);
  })


})
// accepts user_email , user_password , user_role
router.post('/verify', securedWithToken, (req, res, next) => {
res.send(response="ok",status=200)

})
// accepts user_email , user_password , user_role
router.post('/create/public', (req, res, next) => {

  if (conf_sercet.enable_public_interfaces) {

    userModel.create(req.body).then((data) => {

      if (data) return res.send(response = "user was created", status = 200);
      res.send(`${data}`, status = 400);
    }).catch((err) => {

      return res.send(response = err.parent.sqlMessage, status = 500);
    })
  }

  else {
    res.status(400).send("public interface is disabled");
  }


})
// accepts the user_email
router.post('/update', securedWithToken, (req, res, next) => {


  userModel.update(req.body, { where: { user_email: req.body.user_email } }).then((data) => {

    if (data) return res.send(response = `user ${req.body.user_email} was updated.`, status = 200);
    res.send(`record not found, please try again.`, status = 400);
  }).catch((err) => {

    return res.send(response = err.parent.sqlMessage, status = 500);
  })


})
// accepts the record id
router.post('/updateById', securedWithToken, (req, res, next) => {


  userModel.update(req.body, { where: { id: req.body.id } }).then((data) => {

    if (data) return res.send(response = `record id: ${req.body.id} was updated.`, status = 200);
    res.send(`record not found, please try again.`, status = 400);
  }).catch((err) => {

    return res.send(response = err.parent.sqlMessage, status = 500);
  })


})
// accepts the user_email
router.post('/delete', securedWithToken, (req, res, next) => {


  userModel.destroy({ where: { user_email: req.body.user_email } }).then((data) => {

    if (data) return res.send(response = `user ${req.body.user_email} was deleted.`, status = 200);
    res.send(`record not found, please try again.`, status = 200);
  }).catch((err) => {

    return res.send(response = err.parent.sqlMessage, status = 500);
  })


})

/**  ---testing purposes--- */
//for testing
router.post('/test', securedWithToken, (req, res, next) => {
  console.log("hello from test");
  return res.send(response = { "status": 200, "data": `authienticated username is ${req.body.user_email}, and the token is ${req.headers.authorization.split(' ')[1]}` }, status = 200)


})
//ping
router.post('/ping', securedWithToken, (req, res, next) => {

  return res.send(response = 'hello')


})
/** ------ */


module.exports = router;
