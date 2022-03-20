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
var { createTokenValidator, createUserValidator,
    updateUserValidator, updateActiveUserValidator,
    updatePermissionValidator, createUgroupValidator,deleteUgroupValidator,
    updateUgroupValidator,getUserValidator,createRoleValidator } = require('../validators/user.validator.iot')

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

router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["user:update"]),updateUserValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();

    userControl.update_user(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })


});


// delete user 
// post /api/v1/users/delete
// delete user by userid

router.post('/delete', authenticate.authenticateUser,authenticate.UserRoles(["user:delete"]), getUserValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();
    userControl.delete_user(req, request_key)
        .then(() => {
            res.send({
                message: responseList.success.message,
                code: responseList.success.code
            });
        }).catch((error) => {
            res.send({ code: error.code, message: error.message })
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
// Return all users
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["user:list"]), function (req, res) {
    let request_key = uuid();

    userControl.getall_users(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        });

});

// POST /api/v1/users
// Return user by id
// Parameters:
// {
// “Id”: 1
// }
router.post('/', authenticate.authenticateUser, authenticate.UserRoles(["user:list"]),getUserValidator, function (req, res) {
    let request_key = uuid();
    userControl.get_user_id(req, request_key)
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
    let permission = req.body['groupname']
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


/*
POST /api/v1/users/create/u_group
Parameters:groupname,roles and active of a u_group
*/
router.post('/create/usergroup', authenticate.authenticateUser, authenticate.UserRoles(["ugroup:create"]),createUgroupValidator,validateRequestSchema,function (req,res){
    let request_key = uuid();
    let { groupname, roles, active } = req.body;
    userControl.create_ugroup(groupname, roles, active, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })

});


// Update user group 
// Put /api/v1/users/update/ugroup
// update a user group by rec_id

router.put('/update/ugroup', authenticate.authenticateUser, authenticate.UserRoles(["ugroup:update"]), updateUgroupValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();

    userControl.update_ugroup(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })
});


// delete user 
// post /api/v1/users/delete/ugroup
// delete user by userid

router.post('/delete/ugroup', authenticate.authenticateUser,authenticate.UserRoles(["ugroup:delete"]), deleteUgroupValidator, validateRequestSchema, function (req, res) {
    let request_key = uuid();
    userControl.delete_Ugroup(req, request_key)
        .then(() => {
            res.send({
                message: responseList.success.message,
                code: responseList.success.code
            });
        }).catch((error) => {
            res.send({ code: error.code, message: error.message })
        })
});

/*
POST /api/v1/users/create/ugroup/role
Parameters:rolename of a u_group
*/
router.post('/create/ugroup/role', authenticate.authenticateUser, authenticate.UserRoles(["ugroup:create"]),createRoleValidator,validateRequestSchema,function (req,res){
    let request_key = uuid();
    userControl.createRole(req.body, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        })

});


// GET /api/v1/users/usergroups/roles
// Return all usergroups roles
router.get('/usergroups/roles', authenticate.authenticateUser, authenticate.UserRoles(["ugroup:list"]), function (req, res) {
    let request_key = uuid();

    userControl.getallRoles(req, request_key)
        .then((data) => {
            res.send(data)
        }).catch((error) => {
            res.send(error)
        });


});

module.exports = router;
