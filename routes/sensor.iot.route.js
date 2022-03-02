var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
var authenticate = require('../auth/authentication_JWT');
var { log } = require('../config/app.conf.json')

var jwt = require("jsonwebtoken");
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
// end
let { response, request } = require('express');
let { Op, json } = require("sequelize");
//let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();


// models
let { sensorModel } = require('../models/sensor.iot.model')
let { s_groupModel } = require('../models/s_group.iot.model')
let { mqtt_userModel } = require('../models/mqttUser.iot.model')
let { logModel } = require('../models/logger.iot.model')
let { SensorTypeModel } = require('../models/sensortype.iot.model')
// end

// middleware
let { resolve_sensor_id } = require('../middleware/sensor.middleware')
let { resolve_group_id } = require('../middleware/group.middleware');
const { sensor_groupModel } = require('../models/sensorGroup.iot.model');
let { create_log } = require('../middleware/logger.middleware');
// end



// GET / api / v1 / sensor
// Return all sensors profiles 

router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["sensor:list"]), function (req, res, next) {
    let request_key = uuid();
    // code bloc
    // 1. db_operation: select all query
    sensorModel.findAll(
        {
            include: [{
                model: mqtt_userModel,
                required: true,
                attributes: ['username', 'id']
            },
            {
                model: SensorTypeModel,
                required: true,
                attributes: ['type', 'id']
            }]
        }
    ).then((data) => {
        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log('list sensor', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        create_log("list sensor", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.sucess_data.code });

        //end
    }).catch((error) => {
        create_log("list sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    });
});


// Post / api / v1 / sensor /
//     Return a sensor profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/', function (req, res, next) {
    let request_key = uuid();
    try {

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['rec_id']) {
            create_log("list sensor with ID", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        let sensor_id = req.body['rec_id'];

        // validation2 : check group id is a number
        if (!isUuid(sensor_id)) {

            create_log("list sensor with ID", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_invalid_payload.code, code: responseList.error.error_invalid_payload.code })
            return;
        }
        create_log("list sensor", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        sensorModel.findOne({
            where: {
                rec_id: sensor_id
            }
        }).then((data) => {

            // 2. return data in a response.
            create_log("list sensor with ID", log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)

            if (!data || data.length === 0) {
                res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
            }

            // send the response.F
            create_log("list sensor with ID", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.message, code: responseList.success.code });
            //end
        }).catch((error) => {
            create_log("list sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
        });
    } catch (error) {
        create_log("list sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// validate sensor input from json file
function validation(req) {
    let fault_inputs = [];
    let mac_address = req.body['mac_address'];
    if (typeof mac_address === "undefined" || mac_address === "null" || !(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/.test(mac_address))) {
        fault_inputs.push('mac_address');
    }
    let client_id = req.body['client_id'];
    if (typeof client_id === "undefined" || client_id === "null" || client_id.length < 4) {
        fault_inputs.push('client_id');
    }
    let active = req.body['active'];
    if (typeof active === "undefined" || active === "null" || typeof active !== "boolean") {
        fault_inputs.push('active');
    }
    let ota_password = req.body['ota_password'];
    if (ota_password && ota_password.length < 4) {
        fault_inputs.push('ota_password');
    }
    let ap_password = req.body['ap_password'];
    if (ap_password && ap_password.length < 4) {
        fault_inputs.push('ap_password');
    }

    let sensor_type = req.body['sensortypeId'];
    if (typeof sensor_type === "undefined" || sensor_type === "null" || sensor_type.length < 1 || typeof sensor_type !== "number") {
        fault_inputs.push('sensor_type');

    }

    let dns1 = req.body['dns1'];
    if (dns1.length < 4) {
        fault_inputs.push('dns1');
    }
    // length of null
    let dns2 = req.body['dns2'];
    if (dns2.length < 4) {
        fault_inputs.push('dns2');
    }
    let gateway = req.body['gateway'];
    if (gateway.length < 4) {
        fault_inputs.push('gateway');
    }
    let subnet = req.body['subnet'];
    if (typeof subnet === "undefined" || subnet === "null" || !(/255|254|252|248|240|224|192|128|0+/.test(subnet))) {
        fault_inputs.push('subnet');
    }
    let serial_number = req.body['serial_number'];
    if (serial_number && serial_number.length < 4) {
        fault_inputs.push('serial_number');
    }
    let sleep_time = req.body['sleep_time'];
    if (typeof sleep_time === "undefined" || sleep_time === "null" || typeof sleep_time !== "number") {
        fault_inputs.push('sleep_time');
    }
    let ap_name = req.body['ap_name'];
    if (ap_name && ap_name.length < 4) {
        fault_inputs.push('ap_name');
    }
    let node_profile = req.body['node_profile'];
    if (typeof node_profile === "undefined" || node_profile === "null" || node_profile.length < 3) {
        fault_inputs.push('node_profile');
    }
    let board_name = req.body['board_name'];
    if (typeof board_name === "undefined" || board_name === "null" || board_name.length < 4) {
        fault_inputs.push('board_name');
    }
    let board_model = req.body['board_model'];
    if (typeof board_model === "undefined" || board_model === "null" || board_model.length < 4) {
        fault_inputs.push('board_model');
    }
    let sim_serial = req.body['sim_serial'];
    if (sim_serial && sim_serial.length < 4) {
        fault_inputs.push('sim_serial');
    }

    let flags = req.body['flags'];
    if (typeof flags === "undefined" || flags === "null" || flags.length < 4) {
        fault_inputs.push('flags');
    }
    let mqttUserId = req.body['mqttUserId'];
    if (typeof mqttUserId === "undefined" || mqttUserId === "null" || mqttUserId.length < 1 || typeof mqttUserId !== "number") {
        fault_inputs.push('mqttUserId');
    }
    let static_ip = req.body['static_ip'];
    if (static_ip && !(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(static_ip))) {
        fault_inputs.push('static_ip');
    }
    let ap_ip = req.body['ap_ip'];
    if (ap_ip && !(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(ap_ip))) {
        fault_inputs.push('ap_ip');
    }
    let host_ip = req.body['host_ip'];
    if (host_ip && !(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(host_ip))) {
        fault_inputs.push('host_ip');
    }
    let sim_msidm = req.body['sim_msidm'];
    if (sim_msidm && !(/[0-9]{11}/.test(sim_msidm))) {
        fault_inputs.push('sim_msidm');
    }
    return fault_inputs;
}

// Create a sensor
// Post / api / v1 / sensor / create
// Create a sensors profile

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["sensor:create"]), function (req, res, next) {
    let request_key = uuid();
    var fault_inputs = validation(req);
    let missing_keys = [];
    try {

        create_log("create sensor", log.log_level.error, responseList.trace.required_field.message, log.req_type.inbound, request_key, req)
        //  1.validation: request required fields.
        fieldsList.sensor.create.forEach(required_field => {
            if (!Object.keys(req.body).includes(required_field)) {
                missing_keys.push(required_field)
            }
        });

        // if a required key is missing, will raise and error.
        if (missing_keys.length > 0) {
            create_log("create sensor", log.log_level.error, `${responseList.error.error_missing_payload.message} length : ${missing_keys.length}  and ${responseList.error.error_missing_payload.message}: (${missing_keys.toString()})`, log.req_type.inbound, request_key, req)
            // send a response
            res.send({ status: `${responseList.error.error_missing_payload.message} - ${missing_keys.length} field(s) (${missing_keys.toString()})`, code: responseList.error.error_missing_payload.code })
            return;
        }


        if (fault_inputs.length > 0) {
            create_log("create sensor", log.log_level.error, `${responseList.error.error_invalid_payload.message}: (${fault_inputs.toString()}) and length: ${fault_inputs.length} `, log.req_type.inbound, request_key, req)
            // send a response
            res.send({ status: `${responseList.error.error_invalid_input.message} for ${fault_inputs.length} field(s) `, code: responseList.error.error_invalid_input.code, data: fault_inputs, client_id: req.body['client_id'] })
            return;
        }

        // else: create the profile
        sensorModel.create(req.body).then((data) => {
            // 2. return data in a response.
            create_log("create sensor", log.log_level.trace, responseList.trace.exceuting_query.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0) {
                create_log("create sensor", log.log_level.error, responseList.error.error_no_data_created.message, log.req_type.inbound, request_key, req)
                res.send({ status: responseList.error.error_no_data_created.message, code: responseList.error.error_no_data_created.code });
            };
            // send the response.
            create_log("create sensor", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.success_creating_data.code });

            //end
        }).catch((error) => {
            create_log("create sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        });
    } catch (error) {
        create_log("create sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// Update a sensor profile
// Post / api / v1 / sensor / update
// update a sensor's profile by rec_id

router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["sensor:update"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            create_log("update sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
            res.send({
                status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("update sensor", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
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
            create_log("update sensor", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);

            if (!data || data.length === 0 || data[0] === 0) {
                create_log("update sensor", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
                res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            };
            // send the response.
            create_log("update sensor", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });

            //end
        }).catch((error) => {

            create_log("update sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_general.message, message: responseList.error.error_general.code });
        });
    } catch (error) {

        create_log("update sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// Delete a sensor
// Delete / api / v1 /  sensor / delete
// Delete a sensors profile by rec_id

router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["sensor:delete"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']

        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {

            create_log("delete sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
            res.send({
                status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`,
                message: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("delete sensor", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, message: responseList.error.error_missing_payload.code });
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
            create_log("delete sensor", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
            if (!data || data.length === 0 || data[0] == 0) {
                create_log("delete sensor", log.log_level.error, responseList.error.error_no_data_delete.message, log.req_type.inbound, request_key, req);
                res.send({ status: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code });
            };
            // send the response.
            create_log("delete sensor", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });

            //end
        }).catch((error) => {

            create_log("delete sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        });

    } catch (error) {
        create_log("delete sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// Map sensor to a group
// we don't use it till now //
router.put('/update/map', resolve_sensor_id, resolve_group_id, authenticate.authenticateUser, authenticate.UserRoles(["group:create"]), function (req, res, next) {

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
            create_log("update sensor mapping", "ERROR", `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, get_user_id(req))

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (sensor_rec_id.length == 0 || group_rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor mapping - ${responseList.error.error_missing_payload.message}`);
            create_log("update sensor mapping", "ERROR", `${responseList.error.error_missing_payload.message}`, get_user_id(req))

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
                    create_log("update sensor mapping", "INFO", `Success  remove group-sensor mapping ${req.body.group_pk} -> ${req.body.sensor_pk}`, get_user_id(req))

                    // response
                    res.send({ status: responseList.success.code, message: responseList.success.code })

                    break;
                case "modify":
                    // query by the rec_id for group and sensor,
                    // get the pk 
                    // update the groupId with the new_group_pk (req.body)

                    console.log(`g ${req.body.group_pk} == > s ${req.body.sensor_pk} `);
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
                    create_log("update sensor mapping", "INFO", `Success  remove group-sensor mapping ${req.body.group_pk} -> ${req.body.sensor_pk}`, get_user_id(req))

                    // response
                    res.send({ status: responseList.success.code, message: responseList.success.code })

                    break;

            }
        }
        else {
            create_log("update sensor mapping", "ERROR", "invaild payload", get_user_id(req))
            res.send({ status: responseList.error.error_invalid_payload.code, message: responseList.error.error_invalid_payload.message });
        }
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("update sensor mapping", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});




// GET / api / v1 /sensor/mqttuser
// Return all mqtt_user profiles 

router.get('/mqttuser', function (req, res, next) {

    let request_key = uuid();
    // code block
    // 1. db_operation: select all query
    mqtt_userModel.findAll().then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list mqtt_user", log.log_level.error, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
        }
        // send the response.
        create_log("list mqtt_user", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req);
        res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.sucess_data.code });

        //end
    }).catch((error) => {
        create_log("list mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

    });
});



// GET / api / v1 /sensor/sensortype
// Return all sensortypes

router.get('/sensortype', function (req, res, next) {
    let request_key = uuid();
    // code block
    // 1. db_operation: select all query
    SensorTypeModel.findAll().then((data) => {

        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list Sensor_Type", log.log_level.error, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
        }
        // send the response.
        create_log("list sensor_type", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req);
        res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.sucess_data.code });

        //end
    }).catch((error) => {
        create_log("list sensor_type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

    });
});

router.post('/sensortype/create', authenticate.authenticateUser, function (req, res, next) {
    let request_key = uuid();
    SensorTypeModel.create(req.body).then((data) => {
        // 2. return data in a response.
        create_log("create sensor_type", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
        if (!data || data.length === 0) {
            create_log("create sensor_type", log.log_level.error, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
        };
        res.send({ data: data, status: responseList.success.message, code: responseList.success.code });
        //end
    }).catch((error) => {
        create_log("create sensor_type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    });
});



// Delete a sensor stype
// Delete / api / v1 /  sensor / sensortype / delete
// Delete a sensors type profile by rec_id

router.post('/sensortype/delete', authenticate.authenticateUser, function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']

        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {

            create_log("delete sensor type", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
            res.send({
                status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`,
                message: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("delete sensor type", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, message: responseList.error.error_missing_payload.code });
            return;
        }

        // update the record 
        SensorTypeModel.destroy(
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
            create_log("delete sensor type", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
            if (!data || data.length === 0 || data[0] == 0) {
                create_log("delete sensor type", log.log_level.error, responseList.error.error_no_data_delete.message, log.req_type.inbound, request_key, req);
                res.send({ status: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code });
            };
            // send the response.
            create_log("delete sensor type", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });

            //end
        }).catch((error) => {

            create_log("delete sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        });

    } catch (error) {
        create_log("delete sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});


// Update a sensor type profile
// Post / api / v1 / sensor / sensortype / update
// update a sensor type profile by rec_id

router.put('/sensortype/update', authenticate.authenticateUser, function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            create_log("update sensor type", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
            res.send({
                status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("update sensor type", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        }

        // update the record 

        SensorTypeModel.update(req.body,
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },
            }

        ).then((data) => {
            
            // 2. return data in a response.
            create_log("update sensor type", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);

            if (!data || data.length === 0 || data[0] === 0) {
                create_log("update sensor type", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
                res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            };
            // send the response.
            create_log("update sensor type", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });

            //end
        }).catch((error) => {

            create_log("update sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_general.message, message: responseList.error.error_general.code });
        });
    } catch (error) {

        create_log("update sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
    }
});



// 
/** ------ */

module.exports = router;
