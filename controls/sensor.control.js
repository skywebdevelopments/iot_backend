let sensor = require('../models_crud/sensor.model')
let { create_log } = require('../middleware/logger.middleware');
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')

function Createsensor(req, res) {
    let request_key = uuid();
    create_log("create sensor", log.log_level.error, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    sensor.create_sensor(req).then((data) => {
        if (data.rowCount === 0) {
            create_log('Create sensor', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            create_log("Create Sensor", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        create_log("Create sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}

function GetSensors(req, res) {
    let request_key = uuid();
    sensor.getAll().then((data) => {
        if (data.rowCount === 0) {
            create_log('list sensor', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            create_log("List Sensor", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        create_log("List sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}

function GetSensorbyId(req,res) {
    let request_key = uuid();
    sensor.getSensorbyId(req).then((data) => {
        if (data.rowCount === 0) {
            create_log('list sensor by Id', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            create_log("List Sensor by Id", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        create_log("List sensor by Id", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function UpdateSensor(req, res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("update sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("update sensor", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }

    sensor.UpdateSensor(req).then((data) => {

        if (data.rowCount === 0) {
            create_log("update sensor", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            create_log("update sensor", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });
        }

    }).catch((error) => {
        create_log("Update sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function DeleteSensor(req,res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("delete sensor", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("delete sensor", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }


    sensor.deleteSensor(req).then((data) => {
        create_log("delete sensor", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
        if (data.rowCount === 0) {
            create_log("delete sensor", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            create_log("delete sensor", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        }

    }).catch((error) => {
        create_log("delete sensor", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })


}

module.exports = {
    GetSensors,
    GetSensorbyId,
    UpdateSensor,
    DeleteSensor,
    Createsensor

}
