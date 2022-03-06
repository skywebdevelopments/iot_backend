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

// Create a sensor Type
// Post / api / v1 / sensortype / create
// Create a sensor type profile

router.post('/create',function (req, res, next) {
    try {
        control.Create_sensor_type(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })
    }
}
)

// GET / api / v1 / sensortype
// Return all sensor types profiles 
router.get('/', function (req, res, next) {
    try {
        control.GetSensortypes(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })

    }
}
)

// Post / api / v1 / sensortype /
// Return a sensor type profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/', function (req, res, next) {
    try {
        control.GetSensor_type_byId(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })
    }
}
)


// Update a sensor type profile
// Post / api / v1 / sensortype / update
// update a sensor's type profile by rec_id

router.put('/update', function (req, res, next) {
    try {
        control.UpdateSensortype(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })

    }
}
)

// Delete a sensor type
// Delete / api / v1 /  sensortype / delete
// Delete a sensors profile by rec_id


router.post('/delete', function (req, res, next) {
    try {
        control.DeleteSensortype(req, res)
    } catch (error) {
        res.send({ status: error.message, code: 400 })
    }
}
)


module.exports = router;