var express = require('express');
var router = express.Router();
let { uuid } = require('uuidv4');

//configs
var authenticate = require('../auth/authentication_JWT');
var secret = require('../config/sercret.json');
var responseList = require('../config/response.code.json');
var cryptojs = require('crypto-js');

//middleware
let { create_log } = require('../middleware/logger.middleware')

//database models
let { log } = require('../logger/app.logger')
let { userModel } = require('../models/user.iot.model');
let { u_groupModel } = require('../models/u_group.iot.model');
let { sessionModel } = require('../models/session.iot.model');

/*
POST /api/v1/users/token
Return a Token for a specific user.
Parameters:email and password of a user
*/
router.post('/token', (req, res) => {
    const { email, password } = req.body;

    // 1.validation : email
    if (!email || email.length === 0 || email == undefined) {
        log.trace(`${request_key} - ERROR - inbound request - create group - invalid  email `);
        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

    // 2.validation : password
    if (!password || password.length === 0) {
        log.trace(`${request_key} - ERROR - inbound request - create group - invalid  password `);
        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

    //Hashing password from req body before finding in DB
    var hash = cryptojs.HmacSHA256(password, secret.hash_secret);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);

    userModel.findOne({
        where: {
            email: email,
            password: hashInBase64
        },
        include: [{
            model: u_groupModel,
            as: 'u_group'
        }]
    }).then((user) => {
        if (!user) {
           // create_log("login", "ERROR", `Invalid login with email : [ ${email} ]`, req);
            res.send({ status: responseList.error.error_no_user_found.message, code: responseList.error.error_no_user_found.code })
            return;
        }

        // /////////////////////////////////////////
        //user.addUsergroup(2);
        // /////////////////////////////////////////

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
        create_log("login", "INFO", "Successful user login", user.id)
        res.send({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
    }).catch((err) => {
        create_log("login", "ERROR", err.message, -1)
        res.send({ status: err, code: responseList.error.error_not_found.code })
    });
});

/*
POST /api/v1/users/create
Parameters:username,email and password of a user
*/
router.post('/create', (req, res) => {
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
        if (!password || password.length === 0) {
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
                    roles: [],
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
                    create_log("signup", "INFO", "New user was created", data.id)
                    res.send({ data: data, status: responseList.success });

                    //end
                }).catch((err) => {
                    log.trace(`${request_key} - ERROR - inbound request - ${err}`);
                    res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
                })
            }
            else {
                log.trace(`${request_key} - ERROR - inbound request - email already exists!`);
                create_log("signup", "ERROR", `Invalid signup email exists: [ ${email} ]`, -1);
                res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
            }

        }).catch(err => {
            console.log(err);
        })


    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("signup", "ERROR", `Invalid signup with email : [ ${email} ] - ${error.message}`, -1);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }

});

// GET /api/v1/users
// Return all user
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    userModel.findAll({
        attributes: ['id', 'username', 'email', 'roles'],
        include: [{
            model: u_groupModel,
            as: 'usergroup'
        }]
    }).then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list users", "WARN", `No data found in users table`, get_user_id(req));
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        create_log("list users", "INFO", `Success retrieving user data`, get_user_id(req));
        res.send({ data: data, status: responseList.success });
        //end
    }).catch((error) => {
        create_log("list users", "ERROR", error.message, get_user_id(req));
        res.send(error.message)

    });
});



// Update a user roles
// Post /api/v1/users/updaterole
// update a user's role by userid

router.put('/updaterole', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    try {
        // code bloc

        let user_id = req.body['userid']
        let permissions = req.body['permissions']

        // 1.validation: id isn't an empty value
        if (user_id.length == 0) {
            log.trace(` - ERROR - inbound request - update user permission - ${responseList.error.error_missing_payload.message}`);
            create_log("update users' permission", "ERROR", ` ${responseList.error.error_missing_payload.message}`, get_user_id(req));
            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }
        // update the record 
        userModel.update(
            { roles: permissions },
            { where: { id: user_id } }
        ).then((data) => {
            // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
            // 2. return data in a response.
            log.trace(`${user_id} - inbound request - executing the update query`);
            if (!data || data.length === 0 || data[0] === 0) {
                create_log("update users' permission", "ERROR", `No data updated in users table`, get_user_id(req));
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${user_id} - inbound request - send a response`);
            create_log("update users' permission", "INFO", `Success updating user data`, get_user_id(req));
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${user_id} - ERROR - inbound request - ${error}`);
            create_log("update users' permission", "ERROR", error.message, get_user_id(req));
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });
    } catch (error) {
        log.trace(`${user_id} - ERROR - inbound request - ${error}`);
        create_log("update users' permission", "ERROR", error.message, get_user_id(req));
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// GET /api/v1/users/usergroups
// Return all usergroups
router.get('/usergroups', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    u_groupModel.findAll().then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list usergroups", "WARN", `No data found in users table`, get_user_id(req));
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        create_log("list usergroups", "INFO", `Success retrieving user data`, get_user_id(req));
        res.send({ data: data, status: responseList.success });
        //end
    }).catch((error) => {
        create_log("list usergroups", "ERROR", error.message, get_user_id(req));
        res.send(error.message)

    });
});

module.exports = router;
