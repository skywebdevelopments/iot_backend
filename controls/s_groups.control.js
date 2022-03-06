let s_groupmodel = require('../models_crud/s_groups.model')
let { create_log } = require('../middleware/logger.middleware');
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')

function getAll_sgroups(request_key, req) {
    return new Promise((resolve, reject) => {
        create_log('list sensor group', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
        s_groupmodel.getAll_sgroups().then(function (rows) {
            if (!rows || rows.length === 0) {
                create_log('list sensor group', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            }
            create_log('list sensor group', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            resolve(rows)
        }).catch((error) => {
            create_log('list sensor group', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);

        })
    })
}

function get_gSensor_by_id(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('list sensor group with ID', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
        s_groupmodel.get_gSensor_by_id(req).then(function (rows) {
            if (!rows || rows.length === 0) {
                create_log('list sensor group with ID', log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            }
            else
            create_log('list sensor group with ID', log.log_level.info, responseList.success.sucess_data.message, log.req_type.inbound, request_key, req)
            resolve(rows)
        }).catch((error) => {
            create_log('list sensor group with ID', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);

        })
    })
}

function create_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("create sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        s_groupmodel.create_sgroup(req).then(data => {
            if (data.rowCount === 0||data.length === 0) {
                create_log("create sensor group", log.log_level.error, responseList.error.error_already_exists.message, log.req_type.inbound, request_key, req)
            }
            else
            create_log("create sensor group", log.log_level.info, responseList.success.success_creating_data.message, log.req_type.inbound, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function sensorMap_to_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('map sensor to group', log.log_level.trace, responseList.trace.check_data_length.message, log.req_type.inbound, request_key, req)
        s_groupmodel.sensorMap_to_sgroup(req).then(data => {
            if (!data || data.rowCount === 0||data.length === 0) {
                create_log("map sensor to group", log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            }
            else{
            create_log(`query for group with ${req.body['group_rec_id']}`, log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
            create_log("map sensor to group", log.log_level.info, responseList.success.message, log.req_type.inbound, request_key, req)
            }
            resolve(data)
        }).catch((error) => {
            create_log("map sensor to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function update_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("update sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        s_groupmodel.update_sgroup(req).then(data => {
            if (!data || data.rowCount === 0||data.length === 0) {
                create_log("update sensor group",log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            }
            else
            create_log("update sensor group", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}

function delete_sgroup(req,request_key) {
    return new Promise((resolve, reject) => {
        create_log("delete sensor group", log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        s_groupmodel.delete_sgroup(req).then(data => {
            if (!data || data.rowCount === 0||data.length === 0) {
                create_log("delete sensor group",log.log_level.info, responseList.error.error_no_data.message, log.req_type.inbound, request_key, req)
            }
            else
            create_log("delete sensor group", log.log_level.info, responseList.success.success_updating_data.message, log.req_type.inbound, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log("delete sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
            reject(error);
        })
    })
}
module.exports = {
    create_sgroup,
    getAll_sgroups,
    get_gSensor_by_id,
    sensorMap_to_sgroup,
    update_sgroup,
    delete_sgroup
}