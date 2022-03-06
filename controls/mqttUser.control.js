let s_mqttUsermodel = require('../models_crud/mqttUser.model')
let { create_log } = require('../middleware/logger.middleware');
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')



function getAll_mqttUsers(req, res, request_key) {
    create_log('list mqtt_user', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
    s_mqttUsermodel.getAll_mqttUsers().then(data => {
        create_log('list mqtt_user', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        res.send({ data: data, code: responseList.success.code, status: responseList.success.sucess_data.message });
    }).catch((error) => {
        create_log('list mqtt_user', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    })
}

function create_mqttUsers(req, res, request_key) {
    create_log("create mqtt_user", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    s_mqttUsermodel.create_mqttUser(req).then(data => {
        if (data.rowCount === 0) {
            create_log("create mqtt_user", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
            res.send(
                {
                    code: responseList.error.error_already_exists.code,
                    status: responseList.error.error_already_exists.message
                }
            );
            return;
        };
        create_log("create mqtt_user", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
        res.send({
            code: responseList.success.success_creating_data.code,
            status: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        create_log("create mqtt_user", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
    });
}



module.exports = {
    getAll_mqttUsers,
    create_mqttUsers
}