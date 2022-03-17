var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')

let { json } = require("sequelize");
let { uuid, isUuid } = require('uuidv4');
var authenticate = require('../auth/authentication_JWT');
var router = express.Router();

var control = require('../controls/sensor.control')
var { createsensorSchema, RequiredRec_Id, updatesensorSchema } = require('../validators/sensorcreate.validator.iot')
var { validateRequestSchema } = require('../middleware/validate-request-schema')


// GET / api / v1 / sensor
// Return all sensors profiles 
router.get('/',authenticate.authenticateUser, authenticate.UserRoles(["sensor:list"]), function (req, res, next) {
    let request_key = uuid();
    control.GetSensors(req,request_key).then((data) => {
        if (data.length === 0) {
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

// Post / api / v1 / sensor /
//     Return a sensor profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/',authenticate.authenticateUser, authenticate.UserRoles(["sensor:list"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.GetSensorbyId(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        else {
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
            return;
        }
    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}
)

// Create a sensor
// Post / api / v1 / sensor / create
// Create a sensors profile

router.post('/create',authenticate.authenticateUser, authenticate.UserRoles(["sensor:create"]), createsensorSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.Createsensor(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        else {
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });
            return;
        }

    }).catch((error) => {
      
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)



// Update a sensor profile
// Post / api / v1 / sensor / update
// update a sensor's profile by rec_id

router.put('/update',authenticate.authenticateUser, authenticate.UserRoles(["sensor:update"]), updatesensorSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }
    control.UpdateSensor(req,request_key).then((data) => {

        if (data.length === 0) {
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


// Delete a sensor
// Delete / api / v1 /  sensor / delete
// Delete a sensors profile by rec_id


router.post('/delete',authenticate.authenticateUser, authenticate.UserRoles(["sensor:delete"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {

    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }
    control.DeleteSensor(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)


module.exports = router;