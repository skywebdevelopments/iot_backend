var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
var authenticate = require('../auth/authentication_JWT');
var jwt = require("jsonwebtoken");
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
// end
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();


// models
let { sensorModel } = require('../models/sensor.iot.model')
let { groupModel } = require('../models/group.iot.model')
let { mqtt_userModel } = require('../models/mqttUser.iot.model')
let { logModel } = require('../models/logger.iot.model')
let { SensorTypeModel } = require('../models/sensortype.iot.model')
// end

// middleware
let { resolve_sensor_id } = require('../middleware/sensor.middleware')
let { resolve_group_id } = require('../middleware/group.middleware');
const { sensor_groupModel } = require('../models/sensorGroup.iot.model');
// end

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

// GET / api / v1 / sensor
// Return all sensors profiles 

router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["sensor:list"]), function (req, res, next) {
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
            create_log("list sensor", "INFO", "No data found in sensors table", get_user_id(req))
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        create_log("list sensor", "INFO", "Success retrieving sensor data", get_user_id(req))
        // send the response.
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {

        create_log("list sensor", "ERROR", error.message, get_user_id(req))
        res.send(error.message)

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

        // code bloc
        // 1. db_operation: select all query

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['rec_id']) {

            log.trace(`${request_key} - inbound request - ${responseList.error.error_missing_payload.message}`);
            create_log("list sensor with ID", "ERROR", "Error [missing payload] in request body", get_user_id(req))
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        let sensor_id = req.body['rec_id'];

        // validation2 : check group id is a number
        if (!isUuid(sensor_id)) {
            log.trace(`${request_key} - inbound request - ${responseList.error.error_invalid_payload.message}`);
            create_log("list sensor with ID", "ERROR", "Error [invalid payload] in request body", get_user_id(req))
            res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code })
            return;
        }

        log.trace(`${request_key} - inbound request - query with ${sensor_id}`);
        sensorModel.findOne({
            where: {
                rec_id: sensor_id
            }
        }).then((data) => {

            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - check data length`);
            create_log("list sensor with ID", "INFO", "No data found in sensors table", get_user_id(req))
            if (!data || data.length === 0) {
                res.send(
                    { status: responseList.error.error_no_data }
                );
            }
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("list sensor with ID", "INFO", "Success retrieving sensor data", get_user_id(req))
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("list sensor", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })


        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("list sensor", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
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
            create_log("create sensor", "ERROR", `missing ${missing_keys.length} field(s) (${missing_keys.toString()})`, get_user_id(req))
            // send a response
            res.send({ status: `${responseList.error.error_missing_payload.message} - ${missing_keys.length} field(s) (${missing_keys.toString()})`, code: responseList.error.error_missing_payload.code })
            return;
        }


        if (fault_inputs.length > 0) {
            // log the step
            log.trace(`${request_key} - ERROR - inbound request - create sensor - invalid input ${fault_inputs.length} field(s) (${fault_inputs.toString()})`);
            create_log("create sensor", "ERROR", `invalid input ${fault_inputs.length} field(s) (${fault_inputs.toString()})`, get_user_id(req))

            // send a response
            res.send({ status: `${responseList.error.error_invalid_input.message} for ${fault_inputs.length} field(s) `, code: responseList.error.error_invalid_input.code, data: fault_inputs, client_id: req.body['client_id'] })
            return;
        }

        // else: create the profile
        sensorModel.create(req.body).then((data) => {
            // 2. return data in a response.
            log.trace(`${request_key} - inbound request - executing the create query`);
            if (!data || data.length === 0) {
                create_log("create sensor", "ERROR", "No sensor was created", get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("create sensor", "INFO", "Success creating new sensor", get_user_id(req))
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("create sensor", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });


    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("create sensor", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
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
        console.log(rec_id)
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);
            create_log("update sensor", "ERROR", ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, get_user_id(req))
            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - update sensor - ${responseList.error.error_missing_payload.message}`);
            create_log("update sensor", "ERROR", ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, get_user_id(req))

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
                create_log("update sensor", "ERROR", "No sensor data updated", get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("update sensor", "INFO", "Success updating sensor", get_user_id(req))
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("update sensor", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });
    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("update sensor", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
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
            log.trace(`${request_key} - ERROR - inbound request - delete sensor -  ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`);
            create_log("delete sensor", "ERROR", ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, get_user_id(req))

            res.send({
                status: responseList.error.error_invalid_payload.code,
                message: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            log.trace(`${request_key} - ERROR - inbound request - delete group - ${responseList.error.error_missing_payload.message}`);
            create_log("delete sensor", "ERROR", ` ${responseList.error.error_missing_payload.message}`, get_user_id(req))


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
                create_log("delete sensor", "ERROR", "No sensor data deleted", get_user_id(req))
                res.send(
                    { status: responseList.error.error_no_data }
                );
            };
            // send the response.
            log.trace(`${request_key} - inbound request - send a response`);
            create_log("delete sensor", "INFO", "Success deleting sensor", get_user_id(req))
            res.send({ data: data, status: responseList.success });

            //end
        }).catch((error) => {
            log.trace(`${request_key} - ERROR - inbound request - ${error}`);
            create_log("delete sensor", "ERROR", error.message, get_user_id(req))
            res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message });
        });

    } catch (error) {
        log.trace(`${request_key} - ERROR - inbound request - ${error}`);
        create_log("delete sensor", "ERROR", error.message, get_user_id(req))
        res.send({ status: responseList.error.error_general.code, message: responseList.error.error_general.message })
    }
});


// Map sensor to a group
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




// GET / api / v1 /sensor/mqtt_user
// Return all mqtt_user profiles 

router.get('/mqtt_user', function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    mqtt_userModel.findAll().then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list mqtt_user", "INFO", "No data in mqtt_user found", get_user_id(req))
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        create_log("list mqtt_user", "INFO", "Success retrieving mqtt_user data", get_user_id(req))
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {
        create_log("list mqtt_user", "INFO", error.message, get_user_id(req))
        res.send(error.message)

    });
});



router.get('/sensortype', function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    SensorTypeModel.findAll().then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list Sensor_Type", "INFO", "No data in Sensor_type found", get_user_id(req))
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        create_log("list sensor_type", "INFO", "Success retrieving sensor_type data", get_user_id(req))
        res.send({ data: data, status: responseList.success });

        //end
    }).catch((error) => {
        create_log("list sensor_type", "INFO", error.message, get_user_id(req))
        res.send(error.message)

    });
});

router.post('/sensortype/create', authenticate.authenticateUser, function (req, res, next) {
    let request_key = uuid();
                SensorTypeModel.create(req.body).then((data) => 
                {
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
            });



router.get('/Group-sensor', authenticate.authenticateUser, function (req, res, next) {
    // code bloc
    // 1. db_operation: select all query
    groupModel.findAll(
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
