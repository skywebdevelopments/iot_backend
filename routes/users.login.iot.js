var express = require('express');
var router = express.Router();
let { uuid } = require('uuidv4');
let { Op } = require("sequelize");
var { body } = require('express-validator')
//configs
var authenticate = require('../auth/authentication_JWT');
var secret = require('../config/sercret.json');
var responseList = require('../config/response.code.json');
var cryptojs = require('crypto-js');
let { log } = require('../config/app.conf.json')

//middleware
let { create_log } = require('../controls/log.control')

//database models
let { userModel } = require('../models/user.iot.model');
let { u_groupModel } = require('../models/u_group.iot.model');
let { sessionModel } = require('../models/session.iot.model');
let { user_groupModel } = require('../models/userGroup.iot.model');

//controls
let userControl = require('../controls/user.control')

/*
POST /api/v1/users/token
Return a Token for a specific user.
Parameters:email and password of a user
*/
router.post('/token', (req, res) => {
    let request_key = uuid();
    const { email, password } = req.body;
    // 1.validation : check if the req has a body
    if (!req.body || req.body === undefined || !req.body['password'] || !req.body['email']) {
        create_log("login", log.log_level.error, responseList.error.error_missing_payload.message, request_key, req)
        res.send({ code: responseList.error.error_missing_payload.code, status: responseList.error.error_missing_payload.message })
        return;
    }

    // 2.validation : email
    if (!email || email.length === 0 || email == undefined) {
        // log.trace(`${request_key} - ERROR - inbound request - create group - invalid  email `);
        create_log("login", log.log_level.error, `${responseList.error.error_invalid_payload.message} - email`, request_key, 0)
        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

    // 3.validation : password
    if (!password || password.length === 0) {
        create_log("login", log.log_level.error, `${responseList.error.error_invalid_payload.message} - password`, request_key, 0)

        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

    // userControl.create_token(req,res);

    //Hashing password from req body before finding in DB
    var hash = cryptojs.HmacSHA256(password, secret.hash_secret);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
    //end

    userModel.findOne({
        where: {
            email: email,
            password: hashInBase64
        },
        include: [{
            model: u_groupModel,
            as: 'u_groups'
        }]
    }).then((user) => {

        if (!user) {
            create_log("login", log.log_level.error, `${responseList.error.error_no_user_found.message} - [ ${email} ]`, request_key, 0)
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
        create_log("login", log.log_level.info, responseList.success.sucess_login.message, request_key, user.id)
        res.send({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
    }).catch((err) => {
        create_log("login", log.log_level.error, err.message, request_key, 0)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    });
});


/*
POST /api/v1/users/create
Parameters:username,email and password of a user
*/
router.post('/create', body('email').isEmail(), body('password').isStrongPassword(), (req, res) => {
    let request_key = uuid();
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            create_log('create user', log.log_level.error, responseList.error.error_invalid_payload.message, request_key, req)
            res.send({ code: responseList.error.error_invalid_payload.code, status: responseList.error.error_invalid_payload.message })
            return;
        }

        // validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['username'] || !req.body['password'] || !req.body['email']) {
            create_log("create user", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        //create user
        userControl.create_user(req, res)

    } catch (error) {
        create_log('create user', log.log_level.error, error.message, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }

});



// GET /api/v1/users
// Return all user
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    let request_key = uuid();
    try {
        userControl.getall_users(req, res)
    }
    catch (error) {
        create_log('list user', log.log_level.error, error.message, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// TODO -- later untill checked with logic
// error in cannot set header after sent??

// Update user's userGroup 
// Put /api/v1/users/updaterole
// update a user's role by userid

router.put('/updaterole', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    let request_key = uuid();
    try {

        if (!req.body || req.body === undefined) {
            create_log("update users' permission", log.log_level.error, responseList.error.error_missing_payload.message, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
            return;
        }

        let user_id = req.body['userid']
        let permissions = req.body['permissions']

        // 2.validation: id isn't an empty value
        if (!user_id || !permissions || user_id.length == 0) {
            create_log("update users' permission", log.log_level.error, responseList.error.error_missing_payload.message, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
            return;
        }


        userControl.update_permission(req, res);

    } catch (error) {
        create_log("update users' permission", log.log_level.error, error.message, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});

// GET /api/v1/users/usergroups
// Return all usergroups
router.get('/usergroups', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    let request_key = uuid();
    try {
        userControl.getall_usergroups(req, res)
    }
    catch (error) {
        create_log('list u_groups', log.log_level.error, error.message, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});

module.exports = router;
