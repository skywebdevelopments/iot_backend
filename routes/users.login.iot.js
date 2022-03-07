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

//validators
var { validateRequestSchema } = require('../middleware/validate-request-schema')
var { createTokenValidator, createUserValidator, updatePermissionValidator } = require('../validators/user.validator.iot')

/*
POST /api/v1/users/token
Return a Token for a specific user.
Parameters:email and password of a user
*/
router.post('/token', createTokenValidator, validateRequestSchema, (req, res) => {
    let request_key = uuid();
    const { email, password } = req.body;

    userControl.create_token(email, password, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        });

});


/*
POST /api/v1/users/create
Parameters:username,email and password of a user
*/
router.post('/create', createUserValidator, validateRequestSchema, (req, res) => {
    let request_key = uuid();

    let { email, username, password } = req.body;

    //create user
    userControl.create_user(email, username, password, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })

});


// GET /api/v1/users
// Return all user
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res) {
    let request_key = uuid();

    userControl.getall_users(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        });

});

// GET /api/v1/users/usergroups
// Return all usergroups
router.get('/usergroups', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res) {
    let request_key = uuid();

    userControl.getall_usergroups(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        });


});


// Update user's userGroup 
// Put /api/v1/users/updaterole
// update a user's role by userid

router.put('/updaterole', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), updatePermissionValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();

    let user_id = req.body['userid']
    let permission = req.body['permission']


    //check again this validation it catches cannot set headers if user id isnt correct
    // validation : check if user id is a valid user
    userControl.find_user(user_id).catch((err) => {
        create_log("update users' permission", log.log_level.error, responseList.error.error_invalid_payload.message, request_key, req)
        res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
        return;
    })


    // validation : check if permission is valid string in db
    userControl.get_usergroup(req, request_key, permission).then(() => {

        userControl.update_permission(req, request_key)
            .then((data) => {
                res.send(data)
            }).catch((error) => {
                res.send(error)
            });

    }).catch((error) => {
        res.send(error)
    })

});


module.exports = router;
