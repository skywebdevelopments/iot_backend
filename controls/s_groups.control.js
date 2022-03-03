let s_groupmodel = require('../models_crud/s_groups.model')
let { create_log } = require('../middleware/logger.middleware');
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')

function getAll_sgroups() {
    return new Promise((resolve, reject) => {
        resolve(s_groupmodel.getAll_sgroups()
        );
    }).catch((err) => {
        reject(err)
    });
}


function get_gSensor_by_id(req, res, request_key) {
    create_log(`query for sensor group with ${req.body['groupId']}`, log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    s_groupmodel.get_gSensor_by_id(req).then((data) => {
        create_log('list sensor group with ID', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
        if (!data || data.length === 0) {
            create_log('list sensor group with ID', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            res.send(
                { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            );
            return;
        }
        create_log('list sensor group with ID', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
        res.send({ data: data, code: responseList.success.sucess_data.code, status: responseList.success.sucess_data.message });
    }).catch((error) => {
        create_log('list sensor group with ID', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });
}

function create_sgroup(req, res, request_key) {
    create_log("create sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    s_groupmodel.create_sgroup(req).then(data => {
        if (data.rowCount === 0) {
            create_log("create sensor group", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
            res.send(
                {
                    code: responseList.error.error_already_exists.code,
                    status: responseList.error.error_already_exists.message
                }
            );
            return;
        };
        create_log("create sensor group", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
        res.send({
            code: responseList.success.success_creating_data.code,
            status: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
    });
}

function sensorMap_to_sgroup(req, res, request_key) {
    create_log('map sensor to group', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
    s_groupmodel.sensorMap_to_sgroup(req).then(data => {
        create_log("map sensor to group", log.log_level.info, responseList.success.message, log.req_type.inbound, request_key, req)
        res.send({
            code: responseList.success.code,
            status: responseList.success.message
        });
    }).catch((error) => {
        create_log("map sensor to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    })
}

function update_sgroup(req, res, request_key) {
    create_log("update sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    s_groupmodel.update_sgroup(req).then(data => {
        create_log("update sensor group", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)       
        res.send({
            status: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });

}

function delete_sgroup(req, res, request_key) {
    create_log("delete sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
    s_groupmodel.delete_sgroup(req).then(() => {
        create_log("delete sensor group", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)       
        res.send({
            status: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        create_log("delete sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });

}
module.exports = {
    create_sgroup,
    getAll_sgroups,
    get_gSensor_by_id,
    sensorMap_to_sgroup,
    update_sgroup,
    delete_sgroup
}