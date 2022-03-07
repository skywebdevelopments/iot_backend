var express = require('express');
var router = express.Router();
let { uuid } = require('uuidv4');

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
var Sequelize = require('sequelize');


// Create a user Group
// Post /api/v1/u_group/create
// Create a user’ group 

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["u_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code block
        let group_name = req.body['groupname']
        // 1.validation : name
        if (!group_name || group_name.length === 0 || group_name == undefined) {
            create_log("create user group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            });
            return;
        };

        // 2.validation : active flag
        let active_flag = req.body['active']
        if (active_flag.length === 0 || active_flag == undefined) {
            create_log("create user group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            })
            return;
        };
        // 3.validation : roles
        let roles = req.body['roles']
        if (roles == undefined) {
            create_log("create user group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            })
            return;
        };
        //4. validation:types of payload types
        if (typeof group_name !== 'string' || typeof active_flag !== "boolean" || typeof roles !== "object") {
            create_log("create user group", log.log_level.error,responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key,req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }
        u_groupModel.findOne(
            {
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('groupname')),
                    Sequelize.fn('lower', group_name)
                )
            }
        ).then((group) => {
            if (!group) {
                u_groupModel.create(req.body).then((data) => {
                    create_log("create user group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
                    if (!data || data.length === 0) {
                        create_log("create user group", log.log_level.warn, responseList.error.error_no_data_created.message, log.req_type.inbound, request_key, req)
                        res.send(
                            {
                                code: responseList.error.error_no_data_created.code,
                                status: responseList.error.error_no_data_created.message
                            }
                        );
                    };
                    // send the response.
                    create_log("create user group", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
                    res.send({
                        data: data, code: responseList.success.success_creating_data.code,
                        status: responseList.success.success_creating_data.message
                    });
                    //end
                }).catch((error) => {
                    create_log("create user group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
                    res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
                });
            }
            else {
                create_log("create user group", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
                res.send({ code: responseList.error.error_already_exists.code, status: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            create_log("create user group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        })
    } catch (error) {
        create_log("create user group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});


// Map user to u_group
// Post / api / v1 / u_group / usermap
//// Parameters:
// {
// "uGroupId": 3,
// "userId": 1
// }
router.post('/usermap', authenticate.authenticateUser, authenticate.UserRoles(["u_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['uGroupId'] || !req.body['userId']) {
            create_log("map user to group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }
        // code block
        let userId = req.body['userId']
        let uGroupId = req.body['uGroupId']

        // 2.validation: uGroupId and userId isn't an empty value
        if (uGroupId.length == 0 || userId.length == 0) {
            
            create_log("map user to group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            });
            return;
        }
        //3. validation:types of payload types
        if (typeof uGroupId !== 'number' || typeof userId !== 'number') {
            create_log("map user to group", log.log_level.error,responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key,req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }
        create_log(`query for group with ${uGroupId}`, log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        u_groupModel.findOne({
            include: {
                model:userModel,
                as:"users"
            }
            ,
            where: {
                id: uGroupId
            }
        }).then((data) => {
            // 2. return data in a response.
            create_log('map user to group', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0) {
                create_log("map user to group", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                res.send(
                    {
                        code: responseList.error.error_no_data.code,
                        status: responseList.error.error_no_data.message
                    }
                );
            }
            // send the response.
            return data.addUsers(userId)
            //end
        }).then(() => {
            create_log("map user to group", log.log_level.info, responseList.success.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.success.code,
                status: responseList.success.message
            });
        }).catch((error) => {
            create_log("map user to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });
    } catch (error) {
        create_log("map user to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});

module.exports = router;