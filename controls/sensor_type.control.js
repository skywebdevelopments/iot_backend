let sensor_type = require('../models_crud/sensor_type.model')
let { create_log } = require('../middleware/logger.middleware');
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')


function Create_sensor_type(req, res) {
    let request_key = uuid();
    sensor_type.create_sensor_type(req).then((data) => {
        create_log("create sensor_type", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
        if (data.rowCount === 0) {
            create_log("create sensor_type", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_no_data.code });
        }
        else {
            create_log("create sensor_type", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.success_creating_data.code });
        }

    }).catch((error) => {
        create_log("create sensor_type", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function GetSensortypes(req, res) {
    let request_key = uuid();
    sensor_type.getAll_senortype().then((data) => {
        if (data.rowCount === 0) {
            create_log('list sensor_type', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            create_log("List Sensor_type", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        create_log("List sensor_type", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}

function GetSensor_type_byId(req, res) {
    let request_key = uuid();
    sensor_type.getSensor_type_byId(req).then((data) => {
        if (data.rowCount === 0) {
            create_log('list sensor type by Id', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {
            create_log("List Sensor type by Id", log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        create_log("List sensor type by Id", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function UpdateSensortype(req, res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("update sensor type", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("update sensor type", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }

    sensor_type.updateSensortype(req).then((data) => {

        if (data.rowCount === 0) {
            create_log("update sensor type", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            create_log("update sensor type", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });
        }

    }).catch((error) => {
        create_log("Update sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function DeleteSensortype(req, res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("delete sensor type", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("delete sensor type", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }


    sensor_type.deleteSensortype(req).then((data) => {
        create_log("delete sensor type", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
      

      
            create_log("delete sensor type", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        

    }).catch((error) => {
        create_log("delete sensor type", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })


}


module.exports = {
    Create_sensor_type,
    GetSensortypes,
    GetSensor_type_byId,
    UpdateSensortype,
    DeleteSensortype

}