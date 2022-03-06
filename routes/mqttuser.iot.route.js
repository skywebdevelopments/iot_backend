var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
var authenticate = require('../auth/authentication_JWT');
var { log } = require('../config/app.conf.json')

// end
let { Op } = require("sequelize");
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();

// models
let { sensorModel } = require('../models/sensor.iot.model')
let { mqtt_userModel } = require('../models/mqttUser.iot.model')

// end

// middleware
let { create_log } = require('../middleware/logger.middleware');
// end

var control = require('../controls/mqttUser.control')


// GET / api / v1 /mqttuser
// Return all mqtt_user profiles 

router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:list"]), function (req, res) {

    let request_key = uuid();
    // code block
    // 1. db_operation: select all query
    mqtt_userModel.findAll().then((data) => {

        // log.trace(`${uuid()} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data || data.length === 0) {
            create_log("list mqtt_user", log.log_level.warn, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req);
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



/*
POST / api / v1 / mqttuser /create
Parameters:username and password of mqttuser
*/
router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:create"]), (req, res) => {
    let request_key = uuid();
    let username = req.body['username'];
    let password = req.body['password'];

    try {

        // validation1 : check if the req has a body
        if (!req.body || req.body === undefined) {
            create_log("create mqtt_user", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }

        // 2.validation : username
        if (!username || username.length === 0 || username === undefined) {
            create_log("create mqtt_user", log.log_level.error, `${responseList.error.error_missing_payload.message} - username`, log.req_type.inbound, request_key, 0)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        };
        // 3.validation : password
        if (!password || password.length === 0 || password === undefined) {

            create_log("create mqtt_user", log.log_level.error, `${responseList.error.error_missing_payload.message} - password`, log.req_type.inbound, request_key, 0)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        };


        //Hashing password 
        // var hash = cryptojs.HmacSHA256(password, secret.hash_secret);
        // var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
        //end

        mqtt_userModel.findOne({
            where: {
                username: username
            }
        }).then(m_user => {
            if (!m_user) {
                mqtt_userModel.create(req.body)
                    .then((data) => {
                        // 2. return data in a response.
                        create_log("create mqtt_user", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
                        if (!data || data.length === 0) {

                            create_log("create mqtt_user", log.log_level.error, responseList.error.error_no_data_created.message, log.req_type.inbound, request_key, req)
                            res.send({ status: responseList.error.error_no_data_created.message, code: responseList.error.error_no_data_created.code });
                        };
                        create_log("create mqtt_user", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
                        res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });

                        //end
                    }).catch((err) => {

                        create_log("create mqtt_user", log.log_level.error, err.message, log.req_type.inbound, request_key, req)
                        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
                    })
            }
            else {
                create_log("create mqtt_user", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${username} ]`, log.req_type.inbound, request_key, req)
                res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
            }

        }).catch(err => {
            create_log("create mqtt_user", log.log_level.error, err.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });

        })

    } catch (error) {
        create_log("create mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    }

});


//ps not sure about what this api should update?
//is not available in document

// Update mqtt_user
// Post / api / v1 / mqttuser / update
// update mqttuser  by rec_id


router.put('/update', function (req, res, next) {
    try {
        control.UpdateMqttUser(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })

    }
}
)
/*
router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:update"]), function (req, res) {
    let request_key = uuid();

    let rec_id = req.body['rec_id']

    try {
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            create_log("update mqtt_user", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("update mqtt_user", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        }

        mqtt_userModel.update(req.body,
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },

            }

        ).then((data) => {
            // 2. return data in a response.
            create_log("update mqtt_user", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
            if (!data || data[0] === 0 || data.length === 0) {
                create_log("update mqtt_user", log.log_level.error, responseList.error.error_no_data_updated.message, log.req_type.inbound, request_key, req)
                res.send(
                    {
                        status: responseList.error.error_no_data_updated.message,
                        code: responseList.error.error_no_data_updated.code
                    }
                );
            };
            // send the response.
            create_log("update mqtt_user", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.code });

            //end
        }).catch((error) => {
            create_log("update mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });


    } catch (error) {
        create_log("update mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});
*/

// Delete a mqtt_user
// Delete / api / v1 / mqttuser / delete
// Delete a mqttuser by rec_id

router.post('/delete', function (req, res, next) {
    try {
        control.DeleteMqttUser(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })

    }
}
)
/*

router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:delete"]), function (req, res) {
    let request_key = uuid();
    try {
        // code block
        let rec_id = req.body['rec_id']
        // 1.validation: rec_id is uuid v4

        if (!isUuid(rec_id)) {
            create_log("delete mqtt_user", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
            return;
        }

        // 2.validation: rec_id isn't an empty value
        if (rec_id.length == 0) {
            create_log("delete mqtt_user", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        }

        mqtt_userModel.destroy(
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },
            }

        ).then((data) => {
            // 2. return data in a response.
            create_log("delete mqtt_user", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
            if (!data || data.length === 0 || data[0] == 0) {
                create_log("delete mqtt_user", log.log_level.error, responseList.error.error_no_data_delete.message, log.req_type.inbound, request_key, req)
                res.send({ status: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code });
            }
            // send the response.
            create_log("delete mqtt_user", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.code });

            //end
        }).catch((error) => {
            create_log("delete mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
        });
    } catch (error) {
        create_log("delete mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});
*/


module.exports = router;
