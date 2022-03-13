var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
var authenticate = require('../auth/authentication_JWT');
var { log } = require('../config/app.conf.json')


let { Op, json } = require("sequelize");
//let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();

// middleware
let { create_log } = require('../middleware/logger.middleware');
// end
const { body, validationResult } = require('express-validator');

var control = require('../controls/sensor_type.control')

var { RequiredRec_Id, createsensortypeSchema, updatesensortypeSchema } = require('../validators/sensortype.validator.iot')
var { validateRequestSchema } = require('../middleware/validate-request-schema')

// Create a sensor Type
// Post / api / v1 / sensortype / create
// Create a sensor type profile

router.post('/create',authenticate.authenticateUser, authenticate.UserRoles(["sensortype:create"]), createsensortypeSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.Create_sensor_type(req, request_key).then((data) => {
        if (data.rowCount === 0) {
            res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_no_data.code });
        }
        else {
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.success_creating_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)

// GET / api / v1 / sensortype
// Return all sensor types profiles 
router.get('/',authenticate.authenticateUser, authenticate.UserRoles(["sensortype:list"]), function (req, res, next) {
    let request_key = uuid();
    control.GetSensortypes(req, request_key).then((data) => {
        if (data.rowCount === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }
    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })


}
)

// Post / api / v1 / sensortype /
// Return a sensor type profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/',authenticate.authenticateUser, authenticate.UserRoles(["sensortype:list"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    control.GetSensor_type_byId(req, request_key).then((data) => {
        if (data.rowCount === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}
)


// Update a sensor type profile
// Post / api / v1 / sensortype / update
// update a sensor's type profile by rec_id

router.put('/update',authenticate.authenticateUser, authenticate.UserRoles(["sensortype:update"]), updatesensortypeSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }
    control.UpdateSensortype(req, request_key).then((data) => {

        if (data.rowCount === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })


}
)

// Delete a sensor type
// Delete / api / v1 /  sensortype / delete
// Delete a sensor type profile by rec_id


router.post('/delete',authenticate.authenticateUser, authenticate.UserRoles(["sensortype:delete"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }
    
    control.DeleteSensortype(req, request_key).then((data) => {
        if (data.rowCount === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }
        else {
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        }
    }).catch((error) => {
        res.send({ status: error.message, code: responseList.error.error_general.code });
    })
}
)


module.exports = router;