var express = require('express');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
const cryptojs = require('crypto-js');
let { uuid, isUuid } = require('uuidv4');
var secret = require('../config/sercret.json');
let { log } = require('../logger/app.logger')
let { userModel } = require('../models/user.iot.model');
let { sessionModel } = require('../models/session.iot.model');
var responseList = require('../config/response.code.json');

/*
POST /users/GenerateToken
Return a Token for a specific user.
Parameters:username and password of a user
*/
router.post('/GenerateToken', (req, res) => {
    const { email, password } = req.body;

    userModel.findOne({
        where: {
            email: email,
            password: password
        }
    }).then((user) => {
        if (!user) {
            res.send({ status: responseList.error.error_no_user_found.message, code: responseList.error.error_no_user_found.code })
            return;
        }
        var token = authenticate.getToken(user); //create token using id and you can add other inf
        sessionModel.findOne({
            where: {
                userId: user.id,
                active: true
            }
        }).then((session) => {
            if (!session) {
                sessionModel.create({
                    token: token,
                    active: true,
                    userId: user.id
                })
                return;
            }
            sessionModel.update({ active: false }, {
                where: {
                    id: session.id
                }
            })
            sessionModel.create({
                token: token,
                active: true,
                userId: user.id
            })
        })
        res.send({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
    }).catch((err) => {
        res.send({ status: err, code: responseList.error.error_not_found.code })
    });
});

/*
POST /users/signup
Return a Token for a specific user.
Parameters:username and password of a user
*/
router.post('/signup', (req, res) => {
    let request_key = uuid();
    try {

        let username = req.body['username'];
        let password = req.body['password'];
        let email = req.body['email'];

        // 1.validation : username
        if (!username || username.length === 0 || username == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - invalid username `);
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };
        // 2.validation : password
        if (!password || password.length === 0 || !email || email.length === 0 || email == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - invalid  password `);
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };

        // 3.validation : email
        if (!email || email.length === 0 || email == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - invalid  email `);
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };


        var hash = cryptojs.HmacSHA256(password, secret.hash_secret);
        var hashInBase64 = cryptojs.enc.Base64.stringify(hash);

        userModel.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (!user) {
                userModel.create({
                    username: username,
                    password: hashInBase64,
                    email: email,
                    active: true

                }).then((data) => {
                    // 2. return data in a response.
                    log.trace(`${request_key} - inbound request - executing the create query`);
                    if (!data || data.length === 0) {
                        res.send(
                            { status: responseList.error.error_no_data }
                        );
                    };
                    // send the response.
                    log.trace(`${request_key} - inbound request - send a response`);
                    res.send({ data: data, status: responseList.success });

                    //end
                }).catch((err) => {
                    log.trace(`${request_key} - ERROR - inbound request - ${err}`);
                    res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
                })
            }
            else {
                log.trace(`${request_key} - ERROR - inbound request - email already exists!`);
                res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
            }

        }).catch(err => {
            console.log(err);
        })


    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }

});

module.exports = router;
