var express = require('express');
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var jwt = require("jsonwebtoken");
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
let { update_sensor } = require('../middleware/sensor.middleware')

// models
let { sensorModel } = require('../models/sensor.iot.model')
const { s_groupModel } = require('../models/s_group.iot.model');
var authenticate = require('../auth/authentication_JWT');
let { logModel } = require('../models/logger.iot.model')
// end
var Sequelize = require('sequelize');
let { create_log } = require('../middleware/logger.middleware');




// GET / api / v1 / s_groups
// Return all sensors’ groups 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
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
            create_log('list sensor group', log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send(
                { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            );
        }
        create_log('list sensor group', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        // send the response.
        res.send({ data: data, code: responseList.success.code, status: responseList.success.sucess_data.message });

        //end
    }).catch((error) => {
        create_log('list sensor group', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
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
        // code block
        // 1. db_operation: select all query

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['groupId']) {

            create_log('list sensor group with ID', log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_missing_payload.code, status: responseList.error.error_missing_payload.message })
            return;
        }

        let group_id = req.body['groupId'];

        // validation2 : check group id is a number
        if (group_id.length !== 36) {
            create_log('list sensor group with ID', log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_invalid_payload.code, status: responseList.error.error_invalid_payload.message })
            return;
        }

        create_log(`query for sensor group with ${group_id}`, log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)
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
            create_log('list sensor group with ID', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0) {
                create_log('list sensor group with ID', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                res.send(
                    { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
                );
            }
            // send the response.
            create_log('list sensor group with ID', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, code: responseList.success.sucess_data.code, status: responseList.success.sucess_data.message });

            //end
        }).catch((error) => {
            create_log('list sensor group with ID', log.log_level.error,error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });
    } catch (error) {
        create_log('list sensor group with ID', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});

// Create a Group
// Post / api / v1 / s_group / create
// Create a sensors’ group 

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code block
        let group_name = req.body['name']
        // 1.validation : name
        if (!group_name || group_name.length === 0 || group_name == undefined) {
            create_log("create sensor group",log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            });
            return;
        };
        // 2.validation : active flag
        let active_flag = req.body['active']
        if (active_flag.length === 0 || active_flag == undefined) {
            create_log("create sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
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
                    create_log("create sensor group", log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)
                    if (!data || data.length === 0) {
                        create_log("create sensor group", log.log_level.warn, responseList.error.error_no_data_created.message, log.req_type.inbound, request_key, req)
                        res.send(
                            {
                                code: responseList.error.error_no_data_created.code,
                                status: responseList.error.error_no_data_created.message
                            }
                        );
                    };
                    // send the response.
                    create_log("create sensor group", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
                    res.send({
                        data: data, code: responseList.success.success_creating_data.code,
                        status: responseList.success.success_creating_data.message
                    });
                    //end
                }).catch((error) => {
                    create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
                    res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message });
                });
            }
            else {
                create_log("create sensor group", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
                res.send({ code: responseList.error.error_already_exists.code, status: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        })
    } catch (error) {
        create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});



// Map Sensors to s_group
// Post / api / v1 / s_group / sensormap
//// Parameters:
// {
// “group_rec_id”: “f1af8379-3891-446c-9815-1473037c538e”
// “sensorId”: 1
// }
router.post('/sensormap', authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['group_rec_id'] || !req.body['sensorId']) {
            create_log("map sensor to group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }
        // code block
        let sensorId = req.body['sensorId']
        let rec_id = req.body['group_rec_id']

        // 2.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            create_log("map sensor to group", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_invalid_payload.code,
                status: responseList.error.error_invalid_payload.message
            });
            return;
        }
        // 3.validation: rec_id and sensorID isn't an empty value
        if (rec_id == 0 || sensorId.length == 0) {
            create_log("map sensor to group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            });
            return;
        }
        create_log(`query for group with ${rec_id}`, log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)
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
            // 2. return data in a response.
            create_log('map sensor to group', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0) {
                create_log("map sensor to group", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                res.send(
                    {
                        code: responseList.error.error_no_data.code,
                        status: responseList.error.error_no_data.message
                    }
                );
            }
            // send the response.
            create_log("map sensor to group", log.log_level.info, responseList.error.success.message, log.req_type.inbound, request_key, req)
            return data.addSensor(sensorId)
            //end
        }).then(() => {
            res.send({
                code: responseList.error.success.code,
                status: responseList.error.success.message
            });
        }).catch((error) => {
            create_log("map sensor to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });
    } catch (error) {
        create_log("map sensor to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
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
            create_log("update sensor group", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("update sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
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
                    // 2. return data in a response.
                    create_log("update sensor group", log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)
                    if (!data || data[0] === 0 || data.length === 0) {
                        create_log("update sensor group", log.log_level.error, responseList.error.error_no_data_updated.message, log.req_type.inbound, request_key, req)
                        res.send(
                            {
                                status: responseList.error.error_no_data_updated.message,
                                code: responseList.error.error_no_data_updated.code
                            }
                        );
                    };
                    // send the response.
                    create_log("update sensor group", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
                    //update sensors under group
                    if (req.body['active'] === false) {
                        update_sensor(req.body['id'], false,req);
                    } else {
                        update_sensor(req.body['id'], true,req);
                    }
                    //
                    res.send({
                        data: data, status: responseList.success.message,
                        code: responseList.success.code
                    });

                    //end
                }).catch((error) => {
                    create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
                    res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
                });
            }
            else {
                create_log("update sensor group", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
                res.send({ code: responseList.error.error_already_exists.code, status: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        })
    } catch (error) {
        create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
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
            create_log("delete sensor group", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("delete sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
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
            // 2. return data in a response.
            create_log("delete sensor group", log.log_level.trace, responseList.trace.excuting_query.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0 || data[0] == 0) {
                create_log("delete sensor group", log.log_level.error, responseList.error.error_no_data_delete.message, log.req_type.inbound, request_key, req)
                res.send(
                    {
                        status: responseList.error.error_no_data_delete.message,
                        code: responseList.error.error_no_data_delete.code
                    }
                );
            };
            // send the response.
            create_log("delete sensor group", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req)
            res.send({
                data: data, status: responseList.success.message,
                code: responseList.success.code
            });

            //end
        }).catch((error) => {
            create_log("delete sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });
    } catch (error) {
        create_log("delete sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});

// GET / api /  v1 / s_group /sensors
// Return for all groups it's associated sensors
router.get('/sensors', authenticate.authenticateUser, function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    s_groupModel.findAll(
        {
            include: [{
                model: sensorModel,
                as: 'sensor'
            }]
        }
    ).then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list group's sensors ", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send(
                { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            );
        }
        create_log("list group's sensors", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        // send the response.
        res.send({ data: data, code: responseList.success.code, status: responseList.success.sucess_data.message });
    }).catch((error) => {
        create_log("list group's sensors", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({  code: responseList.error.error_general.code, status: responseList.error.error_general.message })

    });
});

// 
/** ------ */

module.exports = router;
