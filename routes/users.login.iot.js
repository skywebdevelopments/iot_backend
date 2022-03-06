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

    userControl.create_token(req, res, request_key);
    
});


/*
POST /api/v1/users/create
Parameters:username,email and password of a user
*/
router.post('/create', (req, res) => {
    let request_key = uuid();
    try {

        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['username'] || !req.body['password'] || !req.body['email']) {
            create_log("create user", log.log_level.error, responseList.error.error_missing_payload.message, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        //create user
        userControl.create_user(req, res, request_key)

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
        userControl.getall_users(req, res, request_key)
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

        // 3.validation : check if permissions array has valid strings
        let getusergroup_promises = [];
        for (let permission of permissions) {
            //compare permissions in body with u_group groupnames
            getusergroup_promises.push(userControl.get_usergroup(req, res, request_key,permission))
        }
        Promise.all(getusergroup_promises).then(() => {
            userControl.update_permission(req, res, request_key);

        }).catch((error) => {
            create_log("update users' permission", log.log_level.error, error.message, request_key, req)
            res.send({ status: error.message, code: error.code })
            return;
        })

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
        userControl.getall_usergroups(req, res, request_key)
    }
    catch (error) {
        create_log('list u_groups', log.log_level.error, error.message, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});

module.exports = router;
