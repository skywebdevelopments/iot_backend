var express = require('express');
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var jwt = require("jsonwebtoken");
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');

// models
let { sensorModel } = require('../models/sensor.iot.model')
const { s_groupModel } = require('../models/s_group.iot.model');
var authenticate = require('../auth/authentication_JWT');
let { logModel } = require('../models/logger.iot.model')

// end
var Sequelize = require('sequelize');



function create_log(operation, log_level, log_message, user_id) {
    logModel.create({
        operation: operation,
        log_level: log_level,
        log_message: log_message,
        user_id: user_id
    })

}

// Extracts user id from token that is sent in headers of the request
function get_user_id(req) {
    var token = null;

    if (req.headers && req.headers['authorization']) {

        var header_token = req.headers['authorization'].split(' ');

        if (header_token.length == 2) {
            var scheme = header_token[0],
                enc_token = header_token[1];

            if (scheme === 'Bearer') {
                token = cryptojs.AES.decrypt(enc_token, secret.token_sercet_key).toString(cryptojs.enc.Utf8);
            }
        }
    }
    var token_payload = jwt.decode(token);
    var user_id = token_payload.id
    return user_id;
}

function update_sensor(group_id, active) {
    let request_key = uuid();
    s_groupModel.findOne(
        {
            where: {
                id: group_id
            },
            include: [{
                model: sensorModel,
                as: 'sensor'
            }]
        }
    ).then((data) => {
        if (data) {
            for (let sensor of data['sensor']) {
                sensorModel.update({ active: active },
                    {
                        where: {
                            id: {
                                [Op.eq]: sensor['id']
                            }
                        },
                    }

                ).then((data) => {
                    // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
                    // 2. return data in a response.
                    log.trace(`${request_key} - inbound request - executing the update query`);
                    if (!data || data.length === 0 || data[0] === 0) {
                        // create_log("update sensor", "ERROR", "No sensor data updated", get_user_id(req))
                        // res.send(
                        //     { status: responseList.error.error_no_data }
                        // );
                    };
                    // send the response.
                    log.trace(`${request_key} - inbound request - sensor updated successfully`);
                    // create_log("update sensor", "INFO", "Success updating sensor", get_user_id(req))
                    //res.send({ data: data, status: responseList.success });

                    //end
                }).catch((error) => {
                    log.trace(`${request_key} - ERROR - inbound request - ${error}`);
                    // create_log("update sensor", "ERROR", responseList.error.error_general.message, get_user_id(req))
                    //res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
                });
            }
        }
    })
}


// GET / api / v1 / s_groups
// Return all sensors’ groups 

router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    s_groupModel.findAll({

        include: {
            model: sensorModel,
            as: "sensor"
        }
    }).then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list group", "INFO", "No data found in groups table", get_user_id(req))
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        create_log("list group", "INFO", "Success retrieving group data", get_user_id(req))
        // send the response.
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {
        create_log("list group", "ERROR", error.message, get_user_id(req))
        res.send(error.message)

    });
});

// Post / api / v1 / s_group /
//     Return a group and all correlated sensors by a groupId
// Parameters:
// {
// “groupId”: 1
// }
router.post('/', authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
    try {

        // code bloc
        // 1. db_operation: select all query

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['groupId']) {

            log.trace(`${request_key} - inbound request - ${responseList.error.error_missing_payload.message}`);
            create_log("list group with ID", "ERROR", "Error [missing payload] in request body", get_user_id(req))
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        let group_id = req.body['groupId'];

        // validation2 : check group id is a number
        if (group_id.length !== 36) {
            log.trace(`${request_key} - inbound request - ${responseList.error.error_invalid_payload.message}`);
            create_log("list group with ID", "ERROR", "Error [invalid payload] in request body", get_user_id(req))
            res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code })
            return;
        }

        log.trace(`${request_key} - inbound request - query with ${group_id}`);
        s_groupModel.findOne({

            include: {
                model: sensorModel,
                as: "sensor"
            }
            ,
            where: {
                rec_id: group_id
            }
        }).then((data) => {

            // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - check data length`);
            if (!data || data.length === 0) {
                create_log("list group with ID", "INFO", "No data found in groups table", get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            }
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("list group with ID", "INFO", "Success retrieving group data", get_user_id(req))
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("list group with ID", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })


        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("list group with ID", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// Create a Group
// Post / api / v1 / s_group / create
// Create a sensors’ group 

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc
        let group_name = req.body['name']
        // 1.validation : name
        if (!group_name || group_name.length === 0 || group_name == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - invalid group name `);
            create_log("create group", "ERROR", `invalid group name `, get_user_id(req))

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: responseList.error.error_invalid_payload.message
            });
            return;
        };
        // 2.validation : active flag
        let active_flag = req.body['active']
        if (active_flag.length === 0 || active_flag == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - active flag is missing`);
            create_log("create group", "ERROR", `active flag is missing`, get_user_id(req))
            res.send({
                status: responseList.error.error_missing_payload.code,
                message: `${responseList.error.error_missing_payload.message} - active flag is missing`
            })
            return;
        };


        s_groupModel.findOne(
            {
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('name')),
                    Sequelize.fn('lower', group_name)
                )
            }
        ).then((group) => {
            if (!group) {
                s_groupModel.create(req.body).then((data) => {
                    // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
                    // 2. return data in a response.
                    log.trace(`${request_key} - inbound request - executing the create query`);
                    if (!data || data.length === 0) {
                        create_log("create group", "INFO", "No group was created", get_user_id(req))
                        res.send(
                            { status: responseList.error.error_no_data }
                        );
                    };
                    // send the response.
                    log.trace(`${request_key} - inbound request - send a response`);
                    create_log("create group", "INFO", "Success creating new group", get_user_id(req))
                    res.send({ data: data, status: responseList.success });
                    //end
                }).catch((error) => {
                    log.trace(`${request_key} - ERROR - inbound request - ${error}`);
                    create_log("create group", "ERROR", error.message, get_user_id(req))
                    res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
                });
            }
            else {
                log.trace(`${request_key} - ERROR - inbound request - Group name already exists!`);
                create_log("create group", "ERROR", "Group name already exists!", get_user_id(req))
                res.send({ status: responseList.error.error_already_exists.code, code: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("create group", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
        })
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("create group", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});



// Assign Sensors to s_group
// Post / api / v1 / s_group / sensormap

router.post('/sensormap', authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['group_rec_id'] || !req.body['sensorId']) {

            log.trace(`${request_key} - inbound request - ${responseList.error.error_missing_payload.message}`);
            create_log("map sensor group", "ERROR", `${responseList.error.error_missing_payload.message} `, get_user_id(req))
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }
        // code block
        let sensorId = req.body['sensorId']
        let rec_id = req.body['group_rec_id']

        // 2.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - sensor mapping -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);
            create_log("map sensor group", "ERROR", `${responseList.error.error_invalid_payload.message} `, get_user_id(req))
            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }
        // 3.validation: rec_id and sensorID isn't an empty value
        if (rec_id == 0 || sensorId.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - sensor mapping - ${responseList.error.error_missing_payload.message}`);
            create_log("map sensor group", "ERROR", `${responseList.error.error_missing_payload.message} `, get_user_id(req))
            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }
        log.trace(`${request_key} - inbound request - query with ${rec_id}`);
        s_groupModel.findOne({
            include: {
                model: sensorModel,
                as: "sensor"
            }
            ,
            where: {
                rec_id: rec_id
            }
        }).then((data) => {

            // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - check data length`);
            if (!data || data.length === 0) {
                create_log("map sensor group", "ERROR", `group not found  `, get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            }
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("map sensor group", "INFO", `Success mapping sensor(s) to group `, get_user_id(req))
            return data.addSensor(sensorId)
            //end
        }).then(() => {
            res.send({ status: responseList.success });
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// Update a Group
// Post / api / v1 / s_group / update
// update a sensors’ group by rec_id

router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["s_group:update"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        let group_name = req.body['name']
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - update group -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);
            create_log("update group", "ERROR", ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, get_user_id(req))
            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update group - ${responseList.error.error_missing_payload.message}`);
            create_log("update group", "ERROR", ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, get_user_id(req))


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }
        
        s_groupModel.findOne(
            {
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('name')),
                    Sequelize.fn('lower', group_name)
                )
            }
        ).then((group) => {
            if (!group || rec_id === group['rec_id']) {
                s_groupModel.update(req.body,
                    {
                        where: {
                            rec_id: {
                                [Op.eq]: rec_id
                            }
                        },
        
                    }
        
                ).then((data) => {
                    // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
                    // 2. return data in a response.
                    log.trace(`${request_key} - inbound request - executing the update query`);
                    if (!data || data[0] === 0 || data.length === 0) {
                        create_log("update group", "ERROR", "No group data updated", get_user_id(req))
                        res.send(
                            { status: responseList.error.error_no_data }
                        );
                    };
                    // send the response.
                    log.trace(`${request_key} - inbound request - send a response`);
                    create_log("update group", "INFO", "Success updating group", get_user_id(req))
                    //update sensors under group
                    if (req.body['active'] === false) {
                        update_sensor(req.body['id'], false);
                    } else {
                        update_sensor(req.body['id'], true);
                    }
                    //
                    res.send({ data: data, status: responseList.success });
        
                    //end
                }).catch((error) => {
                    log.trace(`${request_key} - ERROR - inbound request - ${error}`);
                    create_log("update group", "ERROR", error.message, get_user_id(req))
                    res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
                });
            }
            else {
                log.trace(`${request_key} - ERROR - inbound request - Group name already exists!`);
                create_log("create group", "ERROR", "Group name already exists!", get_user_id(req))
                res.send({ status: responseList.error.error_already_exists.code, code: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("create group", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
        })  
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("update group", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// Delete a Group
// Delete / api / v1 / s_group / delete
// Delete a sensors’ group by rec_id

router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["s_group:delete"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code block
        let rec_id = req.body['rec_id']
        console.log(rec_id)
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - delete group -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);
            create_log("delete group", "ERROR", ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, get_user_id(req))

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - delete group - ${responseList.error.error_missing_payload.message}`);
            create_log("delete group", "ERROR", ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, get_user_id(req))


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }

        //update sensor active to false under group deleted
        update_sensor(req.body['id'], false);

        // update the record 

        s_groupModel.destroy(
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },
            }

        ).then((data) => {
            // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - executing the delete query`);
            if (!data || data.length === 0 || data[0] == 0) {
                create_log("delete group", "ERROR", "No group data deleted", get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("delete group", "INFO", "Success deleting group", get_user_id(req))

            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("delete group", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("delete group", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// GET / api /  v1 / s_group /sensors
// Return for all groups it's associated sensors
router.get('/sensors', authenticate.authenticateUser, function (req, res, next) {
    // code bloc
    // 1. db_operation: select all query
    s_groupModel.findAll(
        {
            include: [{
                model: sensorModel,
                as: 'sensor'
            }]
        }
    ).then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log(" Group-sensor", "INFO", "No data found in the table", get_user_id(req))
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        create_log("Group-sensor", "INFO", "Success retrieving sensor data", get_user_id(req))
        // send the response.
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {

        create_log("Group-sensor", "ERROR", error.message, get_user_id(req))
        res.send(error.message)

    });
});

// 
/** ------ */

module.exports = router;
