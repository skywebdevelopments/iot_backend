let mqtt_user = require('../models_crud/mqttUser.model')
let { create_log } = require('../middleware/logger.middleware');
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')

function UpdateMqttUser(req, res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("update Mqtt User", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("update Mqtt User", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }

    mqtt_user.updateMqttUser(req).then((data) => {

        if (data.rowCount === 0) {
            create_log("update Mqtt User", log.log_level.error, responseList.error.error_no_data_updated, log.req_type.inbound, request_key, req);
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            create_log("update Mqtt User", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });
        }

    }).catch((error) => {
        create_log("Update Mqtt User", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}

function DeleteMqttUser(req, res) {
    let request_key = uuid();
    let rec_id = req.body['rec_id']
    if (!isUuid(rec_id)) {
        create_log("delete Mqtt User", log.log_level.error, ` ${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req)
        res.send({ status: `${responseList.error.error_invalid_payload.message} - value must be a uuidv4 key`, code: responseList.error.error_invalid_payload.code });
    }

    if (rec_id.length == 0) {
        create_log("delete Mqtt User", log.log_level.error, ` ${responseList.error.error_missing_payload.message} - value must be a uuidv4 key`, log.req_type.inbound, request_key, req);
        res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code });
    }


    mqtt_user.deleteMqttUser(req).then((data) => {
        create_log("delete Mqtt User", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req);
      

      
            create_log("delete Mqtt User", log.log_level.info, responseList.success.success_deleting_data.message, log.req_type.inbound, request_key, req);
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        

    }).catch((error) => {
        create_log("delete Mqtt User", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })


}

module.exports = {
    DeleteMqttUser,
    UpdateMqttUser
}