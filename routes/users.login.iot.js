var express = require('express');
var router = express.Router();
let { uuid } = require('uuidv4');
let { Op } = require("sequelize");
//configs
var authenticate = require('../auth/authentication_JWT');
var secret = require('../config/sercret.json');
var responseList = require('../config/response.code.json');
var cryptojs = require('crypto-js');
let { log } = require('../config/app.conf.json')

//middleware
let { create_log } = require('../middleware/logger.middleware')

//database models
let { userModel } = require('../models/user.iot.model');
let { u_groupModel } = require('../models/u_group.iot.model');
let { sessionModel } = require('../models/session.iot.model');
let { user_groupModel } = require('../models/userGroup.iot.model');

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
        create_log("login", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_missing_payload.code, status: responseList.error.error_missing_payload.message })
        return;
    }

    // 2.validation : email
    if (!email || email.length === 0 || email == undefined) {
        // log.trace(`${request_key} - ERROR - inbound request - create group - invalid  email `);
        create_log("login", log.log_level.error, `${responseList.error.error_invalid_payload.message} - email`, log.req_type.inbound, request_key, 0)
        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

    // 3.validation : password
    if (!password || password.length === 0) {
        create_log("login", log.log_level.error, `${responseList.error.error_invalid_payload.message} - password`, log.req_type.inbound, request_key, 0)

        res.send({
            status: responseList.error.error_invalid_payload.message,
            code: responseList.error.error_invalid_payload.code
        });
        return;
    };

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
            create_log("login", log.log_level.error, `${responseList.error.error_no_user_found.message} - [ ${email} ]`, log.req_type.inbound, request_key, 0)
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
        create_log("login", log.log_level.info, responseList.success.sucess_login.message, log.req_type.inbound, request_key, user.id)
        res.send({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
    }).catch((err) => {
        create_log("login", log.log_level.error, err.message, log.req_type.inbound, request_key, 0)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    });
});

/*
POST /api/v1/users/create
Parameters:username,email and password of a user
*/
router.post('/create', (req, res) => {
    let request_key = uuid();
    let username = req.body['username'];
    let password = req.body['password'];
    let email = req.body['email'];

    try {

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['username'] || !req.body['password'] || !req.body['email']) {
            create_log("create user", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        // 2.validation : username
        if (!username || username.length === 0 || username == undefined) {
            create_log("create user", log.log_level.error, `${responseList.error.error_invalid_payload.message} - username`, log.req_type.inbound, request_key, 0)

            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };
        // 3.validation : password
        if (!(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}/.test(password)) || !password || password.length === 0) {

            create_log("create user", log.log_level.error, `${responseList.error.error_invalid_payload.message} - password`, log.req_type.inbound, request_key, 0)

            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };

        // 3.validation : email
        if (!(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(email)) || !email || email.length === 0 || email == undefined) {
            create_log("create user", log.log_level.error, `${responseList.error.error_invalid_payload.message} - email`, log.req_type.inbound, request_key, 0)

            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        };

        //Hashing password from req body before inserting in DB
        var hash = cryptojs.HmacSHA256(password, secret.hash_secret);
        var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
        //end

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
                    create_log("create user", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, 0)
                    if (!data || data.length === 0) {

                        create_log("create user", log.log_level.error, responseList.error.error_no_data_created.message, log.req_type.inbound, request_key, 0)

                        res.send(
                            { status: responseList.error.error_no_data_created.message, code: responseList.error.error_no_data_created.code }
                        );
                    };
                    create_log("create user", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, data.id)
                    res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });

                    //end
                }).catch((err) => {

                    create_log("create user", log.log_level.error, err.message, log.req_type.inbound, request_key, 0)
                    res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
                })
            }
            else {
                create_log("create user", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${email} ]`, log.req_type.inbound, request_key, 0)
                res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
            }

        }).catch(err => {
            create_log("create user", log.log_level.error, err.message, log.req_type.inbound, request_key, 0)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });

        })


    } catch (error) {
        create_log("create user", log.log_level.error, `${responseList.error.error_invalid_input} - [ ${email} ] `, log.req_type.inbound, request_key, 0)
        res.send({ status: responseList.error.error_invalid_input.message, code: responseList.error.error_invalid_input.code })
    }

});

// GET /api/v1/users
// Return all user
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    let request_key = uuid();
    userModel.findAll({
        attributes: ['id', 'username', 'email']
        , include: [{
            model: u_groupModel,
            as: 'u_groups'
        }]
    }).then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list users", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
        }
        // send the response.
        create_log("list users", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        //end
    }).catch((error) => {
        create_log("list users", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

    });
});


// TODO -- later untill checked with logic
// error in cannot set header after sent??

// Update user's userGroup 
// Put /api/v1/users/updaterole
// update a user's role by userid

router.put('/updaterole', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    try {
        // code bloc
        let request_key = uuid();
        let user_id = req.body['userid']
        let permissions = req.body['permissions']

        // 1.validation: id isn't an empty value
        if (!user_id || !permissions || user_id.length == 0) {
            create_log("update users' permission", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
            return;
        }
        // update the record 

        userModel.findOne({
            where: {
                id: user_id
            },
            include: [{
                model: u_groupModel,
                as: "u_groups",
                attributes: ["groupname", "id"]
            }]
        }).then((user) => {
            //  Check if user is found
            if (!user || user.length === 0) {
                create_log("update users' permission", log.log_level.error, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
                return;
            }
            else {

                //check for newly added permissions
                for (let permission of permissions) {

                    //find new user permissions added to a user
                    //if undefiend add permission to user
                    let found = user['u_groups'].find((elem) => {
                        return (elem['groupname'] === permission)
                    })

                    if (found === undefined) {

                        //find new add permission in u_group table
                        //add found permission (groupname) to user 
                        u_groupModel.findOne({
                            where: {
                                groupname: permission
                            }
                        }).then((u_group) => {
                            //check if groupname exists
                            if (!u_group) {
                                create_log("update users' permission", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
                                res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
                                return;
                            }
                            else {
                                user.addU_groups(u_group.id)
                                //log
                                create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.outbound, request_key, req)
                            }
                        }).catch(error => {

                            //log
                            create_log("update users' permission", log.log_level.error, error.message, log.req_type.outbound, request_key, req)
                            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
                        })
                    }

                }

                //check if user has existing permissions
                if (user['u_groups']) {

                    //iterate through user's existing permissions
                    for (let u_group of user['u_groups']) {

                        //if false delete " u_group['groupname'] " from user's existing permissions
                        let found = permissions.includes(u_group['groupname'])

                        if (!found) {
                            user_groupModel.destroy({
                                where: {
                                    [Op.and]: [
                                        { uGroupId: u_group['id'] },
                                        { userId: user_id }
                                    ]
                                }
                            }).then((data) => {
                                //success removing permission
                                create_log("update users' permission", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.outbound, request_key, req)

                            }).catch(error => {
                                create_log("update users' permission", log.log_level.error, error.message, log.req_type.outbound, request_key, req)
                                res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
                                return;
                            })
                        }

                    }
                }

                // send the response.
                // create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
                res.send({ user: user, status: responseList.success.success_updating_data.message, code: responseList.success.code });
                //end
            }
        }).catch(error => {
            create_log("update users' permission", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
        })

        /*userModel.update(
            { roles: permissions },
            { where: { id: user_id } }
        ).then((data) => {

            // 2. return data in a response.
            create_log("update users' permission", log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)

            if (!data || data.length === 0 || data[0] === 0) {
                create_log("update users' permission", log.log_level.error, responseList.error.error_no_data_updated.message, log.req_type.inbound, request_key, req)
                res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            };
            // send the response.
            create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });

            //end
        }).catch((error) => {

            create_log("update users' permission", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });*/

    } catch (error) {
        create_log("update users' permission", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// GET /api/v1/users/usergroups
// Return all usergroups
router.get('/usergroups', authenticate.authenticateUser, authenticate.UserRoles(["admin"]), function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    let request_key = uuid();
    u_groupModel.findAll().then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list usergroups", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
            return;
        }
        // send the response.
        create_log("list usergroups", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.sucess_data.code });
        //end
    }).catch((error) => {
        create_log("list usergroups", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

    });
});

module.exports = router;
