var express = require('express');
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
// models
let { sensorModel } = require('../models/sensor.iot.model')
let { sensor_groupModel } = require('../models/sensorGroup.iot.model');
const { groupModel } = require('../models/group.iot.model');
// end



// GET / api / v1 / groups
// Return all sensors’ groups 

router.get('/', function (req, res, next) {
    // code bloc
    // 1. db_operation: select all query
    groupModel.findAll({

        include: {
            model: sensorModel,
            as: "sensor"
        }
    }).then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {
        console.error(error);
        res.send(error.message)

    });
});

// Post / api / v1 / group /
//     Return a group and all correlated sensors by a groupId

// Parameters:
// {
// “groupId”: 1
// }


router.post('/', function (req, res, next) {
    let request_key = uuid();
    try {

        // code bloc
        // 1. db_operation: select all query

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['groupId']) {

            log.trace(`${request_key} - inbound request - ${responseList.error.error_missing_payload.message}`);
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        let group_id = req.body['groupId'];

        // validation2 : check group id is a number
        if (group_id.length !== 36) {
            log.trace(`${request_key} - inbound request - ${responseList.error.error_invalid_payload.message}`);
            res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code })
            return;
        }

        log.trace(`${request_key} - inbound request - query with ${group_id}`);
        groupModel.findOne({

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
                res.send(
                    { status: responseList.error.error_no_data }
                );
            }
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })


        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// Create a Group
// Post / api / v1 / group / create
// Create a sensors’ group 

router.post('/create', function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc
        let group_name = req.body['name']
        // 1.validation : name
        if (!group_name || group_name.length === 0 || group_name == undefined) {
            log.trace(`${request_key} - ERROR - inbound request - create group - invalid group name `);
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
            res.send({
                status: responseList.error.error_missing_payload.code,
                message: `${responseList.error.error_missing_payload.message} - active flag is missing`
            })
            return;
        };
        groupModel.create(req.body).then((data) => {
            // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - executing the create query`);
            if (!data || data.length === 0) {
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// Update a Group
// Post / api / v1 / group / update
// update a sensors’ group by rec_id

router.put('/update', function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        console.log(rec_id)
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - update group -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update group - ${responseList.error.error_missing_payload.message}`);


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }

        // update the record 

        groupModel.update(req.body,
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
            if (!data || data.length === 0) {
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });




    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// Delete a Group
// Delete / api / v1 / group / delete
// Delete a sensors’ group by rec_id

router.delete('/delete', function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        console.log(rec_id)
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - delete group -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - delete group - ${responseList.error.error_missing_payload.message}`);


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }

        // update the record 

        groupModel.destroy(
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
            if (!data || data.length === 0) {
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });




    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// 
/** ------ */

module.exports = router;
