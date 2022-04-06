
var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')

let { json } = require("sequelize");
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();

var control = require('../controls/report.control')

var { validateRequestSchema } = require('../middleware/validate-request-schema')


// GET / api / v1 /report
// Return all nodes profiles 
router.get('/', function (req, res, next) {
    let request_key = uuid();
    control.getDashboardStats(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {

            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)


module.exports = router;