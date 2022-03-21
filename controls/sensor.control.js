let sensor = require('../models_crud/sensor.model')
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')
let { create_log } = require('../controls/log.control')
var cryptojs = require('crypto-js');

function Createsensor(req, request_key) {
    
    req.body['ota_password']=hash_pass( req.body['ota_password'])
    req.body['ap_password']=hash_pass( req.body['ap_password'])
    create_log("create sensor", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
    return new Promise((resolve, reject) => {
        sensor.create_sensor(req).then((data) => {
            if (!data || data.length === 0 ||  data[0] === 0 ) {
                create_log('Create sensor', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
                return;
            }
            else {
                create_log("Create Sensor", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve(data);
                return;
            }

        }).catch((error) => {
            create_log("Create sensor", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

// parameters: password
// hashes password sha256
// returns: string
function hash_pass(password) {
    //Hashing password from req body before inserting in DB
    var hash = cryptojs.SHA256(password);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
    return hashInBase64
    //end
}

function GetSensors(req, request_key) {
    return new Promise((resolve, reject) => {
        sensor.getAll().then((data) => {
            if (!data || data.length === 0 ||  data[0] === 0 ) {
                create_log('list sensor', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("List Sensor", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List sensor", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function GetSensorbyId(req, request_key) {
    return new Promise((resolve, reject) => {
        sensor.getSensorbyId(req).then((data) => {
            if (!data || data.length === 0 ||  data[0] === 0 ) {
                create_log('list sensor by Id', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("List Sensor by Id", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List sensor by Id", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function UpdateSensor(req, request_key) {

    return new Promise((resolve, reject) => {
        sensor.UpdateSensorr(req).then((data) => {
         
            if (!data || data.length === 0 ||  data[0] === 0 ) {
                create_log("update sensor", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req);
                reject(data);
            }
            else {
                create_log("update sensor", log.log_level.info, responseList.success.success_updating_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("Update sensor", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function DeleteSensor(req, request_key) {

    

    return new Promise((resolve, reject) => {
        sensor.deleteSensor(req).then((data) => {
            create_log("delete sensor", log.log_level.trace, responseList.trace.executing_query.message, request_key, req);
            if (!data || data.length === 0 ||  data[0] === 0 ) {
                create_log("delete sensor", log.log_level.error, responseList.error.error_no_data_updated, request_key, req);
                resolve(data);
            }

            else {
                create_log("delete sensor", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("delete sensor", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })

}

module.exports = {
    GetSensors,
    GetSensorbyId,
    UpdateSensor,
    DeleteSensor,
    Createsensor

}
