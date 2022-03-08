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
var { createTokenValidator, createUserValidator, updateUserValidator, updateActiveUserValidator, updatePermissionValidator } = require('../validators/user.validator.iot')

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

// Update user 
// Put /api/v1/users/update
// update a user's username or password by userid

router.put('/update', authenticate.authenticateUser, updateUserValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();

    userControl.update_user(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })


});

// Update user active
// Put /api/v1/users/updateactive
// update a user's active by userid

router.put('/updateactive', authenticate.authenticateUser, authenticate.UserRoles(["user:update"]), updateActiveUserValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();

    userControl.update_active_user(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })


});


// GET /api/v1/users
// Return all user
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["user:list"]), function (req, res) {
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
router.get('/usergroups', authenticate.authenticateUser, authenticate.UserRoles(["user:list"]), function (req, res) {
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

router.put('/updaterole', authenticate.authenticateUser, authenticate.UserRoles(["user:update"]), updatePermissionValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();
    let permission = req.body['permission']

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
