var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { securedWithToken, decryptReqBody, encrypt, decrypt } = require('../securitylayer/auth')
let { tokenModel } = require('../models/token.model');
let { userModel } = require('../models/user.iot.model');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid } = require('uuidv4');
var router = express.Router();




// get user token (login)
router.post('/auth', function (req, res, next) {
  let uuid_key = uuid()


  let username = req.body.user_email;
  let password = req.body.user_password;

  log.trace(`${uuid_key} - inbound request - ${username}`);


  userModel.findAll({
    where: {
      [Op.and]: [
        { user_email: username }
      ]
    },
  }).then((data) => {
    // user_email not found
    data.length === 0 ? () => { log.trace(`${uuid_key} - user not found`); res.send(response = "user email wasn't found", status = 401) } : log.trace(`${uuid_key} - user was found`);
    //user found


    let db_password = data[0].user_password
    let db_user_role = data[0].user_role

    bcrypt.compare(password, db_password, function (err, result) {
      err ? () => { log.trace(`${uuid_key} - ${username} - 401 `); res.send(response = err, status = 401) }: "";

      if (!result) {
        let userPayload = { name: username, role: db_user_role };
        let accessToken = jwt.sign(userPayload, conf_sercet.token_sercet_key, { expiresIn: conf_sercet.token_expiry_duration })
        //
        //store token for reference.
        tokenModel.create({ user_email: username, token_key: accessToken }).then((data) => {
          if (data)  { log.trace(`${uuid_key} - ${username} was authorized`); res.send(response = { accessToken: accessToken }, status = 200) }
          else { log.trace(`${uuid_key} - error caching the token key`);res.send(response = "error caching the token key.", status = 401);}
        }).catch((err) => {
          next(err);
        });
      }
      else {
        //login info not found
        log.trace(`${uuid_key} - ${username} - invalid login information`);
        return res.send(response = "invalid login information", status = 401);

        //
      }

    });



    //end

  });


});

// accepts user_email , user_password , user_role
router.post('/create', securedWithToken, (req, res, next) => {

  let password = req.body['user_password'];
  bcrypt.hash(password, 10, function (err, hash) {

    req.body['user_password'] = hash
    userModel.create(req.body).then((data) => {

      if (data) return res.send(response = "user was created", status = 200, statusText = "success", statusClass = "success");
      res.send(`${data}`, status = 400);
    }).catch((err) => {

      return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
  });



});
// accepts user_email , user_password , user_role
router.post('/verify', securedWithToken, (req, res, next) => {
  console.log(req.body);

  res.send(response = "ok", status = 200)

});
// accepts user_email , user_password , user_role
router.post('/create/public', (req, res, next) => {
  let password = req.body['user_password'];
  if (conf_sercet.enable_public_interfaces) {

    bcrypt.hash(password, 10, function (err, hash) {

      req.body['user_password'] = hash
      userModel.create(req.body).then((data) => {

        if (data) {
          return res.send(response = "user was created", status = 200);
        }
        else {
          return res.send(response = "error while creating the user", status = 400);

        }

      }).catch((err) => {

        return res.send(response = "error occured!", status = 500);
      })
    });
  }

  else {
    res.status(400).send("public interface is disabled");
  }


});
// accepts the user_email : updates the whole record with user-email.
router.post('/update', securedWithToken, (req, res, next) => {
  let password = req.body['user_password'];
  bcrypt.hash(password, 10, function (err, hash) {

    req.body['user_password'] = hash
    userModel.update(req.body, { where: { user_email: req.body.user_email } }).then((data) => {


      if (data) return res.send(response = `user ${req.body.user_email} was updated.`, status = 200);
      res.send(`record not found, please try again.`, status = 400);
    }).catch((err) => {

      return res.send(response = err, status = 500);
    })
  });

});
// accepts the record id
router.post('/updateById', securedWithToken, (req, res, next) => {
  let password = req.body['user_password'];
  bcrypt.hash(password, 10, function (err, hash) {

    req.body['user_password'] = hash
    userModel.update(req.body, { where: { id: req.body.id } }).then((data) => {


      if (data) return res.send(response = `user ${req.body.user_email} was updated.`, status = 200);
      res.send(`record not found, please try again.`, status = 400);
    }).catch((err) => {

      return res.send(response = err, status = 500);
    })
  });
});
// accepts the user_email
router.post('/delete', securedWithToken, (req, res, next) => {


  userModel.destroy({ where: { user_email: req.body.user_email } }).then((data) => {

    if (data) return res.send(response = `user ${req.body.user_email} was deleted.`, status = 200);
    res.send(`record not found, please try again.`, status = 200);
  }).catch((err) => {

    return res.send(response = err, status = 500);
  })


});

/**  ---testing purposes--- */
//for testing
router.post('/test', securedWithToken, (req, res, next) => {
  console.log("hello from test");
  return res.send(response = { "status": 200, "data": `authienticated username is ${req.body.user_email}, and the token is ${req.headers.authorization.split(' ')[1]}` }, status = 200)


})

//ping
router.post('/test/enc', securedWithToken, decryptReqBody, (req, res, next) => {
  console.log(req.body)
  let date = new Date();
  let encrypted_response = encrypt(`${date.toUTCString()}: 
  <h3 class="text-dark text-left"> <b>message from backend middleware</b>: displying data from an <code>encrypted response</code></h3>
  <hr>

  
  `);
  res.send({ "data": encrypted_response });

})
router.post('/ping', securedWithToken, (req, res, next) => {

  let prom = new Promise((resolve, reject) => {
    let x = encrypt(payload);
    resolve(x)
  })

  prom.then((data) => {

    return res.send(response = data)
  }).catch((err) => {
    res.send(response = err)
  })


})

/** ------ */


module.exports = router;
