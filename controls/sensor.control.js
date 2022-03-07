let sensor = require('../models_crud/sensor.model')
let { create_log } = require('../middleware/logger.middleware');
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')

function Createsensor(req, request_key) {
    create_log("create sensor", log.log_level.error, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    return new Promise((resolve, reject) => {
        sensor.create_sensor(req).then((data) => {
            if (data.rowCount === 0) {
                create_log('Create sensor', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                resolve(data)
            }
            else {
                create_log("Create Sensor", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
                resolve(data)
            }

        }).catch((error) => {
            create_log("Create sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function GetSensors(req, request_key) {
    return new Promise((resolve, reject) => {
        sensor.getAll().then((data) => {
            if (data.rowCount === 0) {
                create_log('list sensor', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                resolve(data);
            }
            else {
                create_log("List Sensor", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function GetSensorbyId(req, request_key) {
    return new Promise((resolve, reject) => {
        sensor.getSensorbyId(req).then((data) => {
            if (data.rowCount === 0) {
                create_log('list sensor by Id', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
                resolve(data);
            }
            else {
                create_log("List Sensor by Id", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List sensor by Id", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function UpdateSensor(req, request_key) {

    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("update sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
    }

    if (rec_id.length == 0) {
        create_log("update sensor", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
    }
    return new Promise((resolve, reject) => {
        sensor.UpdateSensor(req).then((data) => {
            if (data.rowCount === 0) {
                create_log("update sensor", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
                resolve(data);
            }
            else {
                create_log("update sensor", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("Update sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function DeleteSensor(req, request_key) {

    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("delete sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
    }

    if (rec_id.length == 0) {
        create_log("delete sensor", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
    }

    return new Promise((resolve, reject) => {
        sensor.deleteSensor(req).then((data) => {
            create_log("delete sensor", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
            if (data.rowCount === 0) {
                create_log("delete sensor", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
                resolve(data);
            }

            else {
                create_log("delete sensor", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("delete sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
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
