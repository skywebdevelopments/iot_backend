var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
// end
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();


// models
let { sensorModel } = require('../models/sensor.iot.model')
let { groupModel } = require('../models/group.iot.model')
// end

// middleware
let { resolve_sensor_id } = require('../middleware/sensor.middleware')
let { resolve_group_id } = require('../middleware/group.middleware');
const { sensor_groupModel } = require('../models/sensorGroup.iot.model');
// end



// GET / api / v1 / sensor
// Return all sensors profiles 

router.get('/', function (req, res, next) {
    // code bloc
    // 1. db_operation: select all query
    sensorModel.findAll().then((data) => {

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

// Post / api / v1 / sensor /
//     Return a sensor profile
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
        if (!req.body || req.body === undefined || !req.body['rec_id']) {

            log.trace(`${request_key} - inbound request - ${responseList.error.error_missing_payload.message}`);
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        let sensor_id = req.body['rec_id'];

        // validation2 : check group id is a number
        if (!isUuid(sensor_id)) {
            log.trace(`${request_key} - inbound request - ${responseList.error.error_invalid_payload.message}`);
            res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code })
            return;
        }

        log.trace(`${request_key} - inbound request - query with ${sensor_id}`);
        sensorModel.findOne({
            where: {
                rec_id: sensor_id
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

// Create a sensor
// Post / api / v1 / sensor / create
// Create a sensors profile

router.post('/create', function (req, res, next) {
    let request_key = uuid();
    let missing_keys = [];
    try {
        // code bloc

        log.trace(`${request_key} - ERROR - inbound request - create sensor - check required fields`);

        //  1.validation: request required fields.
        fieldsList.sensor.create.forEach(required_field => {

            if (!Object.keys(req.body).includes(required_field)) {
                missing_keys.push(required_field)
            }

        });
        // if a required key is missing, will raise and error.

        if (missing_keys.length > 0) {
            // log the step
            log.trace(`${request_key} - ERROR - inbound request - create sensor - missing ${missing_keys.length} field(s) (${missing_keys.toString()})`);

            // send a response
            res.send({ status: `${responseList.error.error_missing_payload.message} - ${missing_keys.length} field(s) (${missing_keys.toString()})`, code: responseList.error.error_missing_payload.code })
            return;


        }

        // else: create the profile
        sensorModel.create(req.body).then((data) => {
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


// Update a sensor profile
// Post / api / v1 / sensor / update
// update a sensor's profile by rec_id

router.put('/update', function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        console.log(rec_id)
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor - ${responseList.error.error_missing_payload.message}`);


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }

        // update the record 

        sensorModel.update(req.body,
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
            if (!data || data.length === 0 || data[0] === 0) {
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


// Delete a sensor
// Delete / api / v1 /  sensor / delete
// Delete a sensors profile by rec_id

router.post('/delete', function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']

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
        sensorModel.destroy(
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



// Map sensor to a group
router.put('/update/map', resolve_sensor_id, resolve_group_id, function (req, res, next) {

    let request_key = uuid();
    try {
        // code bloc

        // parse the group id , the sensor id and operation
        let group_rec_id = req.body['group_rec_id']
        let sensor_rec_id = req.body['sensor_rec_id']
        let operation = req.body['operation']



        // 1.validation: rec_id is uuid v4

        if (!isUuid(group_rec_id) || !isUuid(sensor_rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor mapping -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (sensor_rec_id.length == 0 || group_rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor mapping - ${responseList.error.error_missing_payload.message}`);


            res.send({
                status: responseList.error.error_missing_payload.code,
                message: responseList.error.error_missing_payload.message
            });
            return;
        }

        // update the record 

        // check if pk was returned 
        if (req.body["sensor_pk"] && req.body["group_pk"]) {
            console.log(operation);
            // check the operation
            switch (operation) {
                case "remove":

                    // destroy query
                    sensor_groupModel.destroy({
                        where: {
                            [Op.and]: [
                                { sensorId: req.body.sensor_pk },
                                { groupId: req.body.group_pk }
                            ]
                        }
                    })
                    // report 

                    log.trace(`${request_key} - inbound request - remove group-sensor mapping ${req.body.group_pk} -> ${req.body.sensor_pk}`);

                    // response
                    res.send({ status: responseList.success.code, message: responseList.success.code })

                    break;
                case "modify":
                    // query by the rec_id for group and sensor,
                    // get the pk 
                    // update the groupId with the new_group_pk (req.body)

                    console.log(`g ${req.body.group_pk} == > s ${req.body.sensor_pk } `);
                    // destroy query
                    sensor_groupModel.findOne({
                        where: {
                            [Op.and]: [
                                { sensorId: req.body.sensor_pk },
                                { groupId: req.body.group_pk }
                            ]
                        }
                    }).then(data => {
                        if (data) {
                          
                            // update
                            sensor_groupModel.update(

                                
                                { groupId: req.body.new_group_pk }
                                , {
                                    where: {
                                        [Op.and]: [
                                            { sensorId: req.body.sensor_pk },
                                            { groupId: req.body.group_pk }
                                        ]
                                    }
                                })

                        }
                       
                    })
                    // report 

                    log.trace(`${request_key} - inbound request - remove group-sensor mapping ${req.body.group_pk} -> ${req.body.sensor_pk}`);

                    // response
                    res.send({ status: responseList.success.code, message: responseList.success.code })

                    break;

            }
        }
        else {
            res.send({ status: responseList.error.error_invalid_payload.code, message: responseList.error.error_invalid_payload.message });
        }
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});

// 
/** ------ */

module.exports = router;
