let s_groupmodel = require('../models_crud/s_groups.model')
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')
let { create_log } = require('../controls/log.control')

function getAll_sgroups(request_key, req) {
    return new Promise((resolve, reject) => {
        create_log('list sensor group', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        s_groupmodel.getAll_sgroups().then(data => {
            if (!data || data.length === 0) {
                create_log('list sensor group', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('list sensor group', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('list sensor group', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function get_gSensor_by_id(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('list sensor group with ID', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        s_groupmodel.get_gSensor_by_id(req).then(data => {
            if (!data || data.length === 0) {
                create_log('list sensor group with ID', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('list sensor group with ID', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('list sensor group with ID', log.log_level.error, error.message, request_key, req)
            reject(error);

        })
    })
}

function create_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("create sensor group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        s_groupmodel.create_sgroup(req).then(data => {
            if (!data || data.length === 0) {
                create_log("create sensor group", log.log_level.warn, responseList.error.error_no_data_created.message, request_key, req)
                reject({ code: responseList.error.error_no_data_created.code, message: responseList.error.error_no_data_created.message });
            }
            else {
                create_log("create sensor group", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("create sensor group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function sensorMap_to_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('map sensor to group', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        s_groupmodel.sensorMap_to_sgroup(req).then(data => {
            create_log(`query for group with ${req.body['group_rec_id']}`, log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
            create_log("map sensor to group", log.log_level.info, responseList.success.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log("map sensor to group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function update_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("update sensor group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        s_groupmodel.update_sgroup(req).then(data => {
            if (!data || data[0] === 0 || data.length === 0) {
                create_log("update sensor group", log.log_level.info, responseList.error.error_no_data_updated.message, request_key, req)
                reject(
                    {
                        message: responseList.error.error_no_data_updated.message,
                        code: responseList.error.error_no_data_updated.code
                    })
            }
            else {
                create_log("update sensor group", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("update sensor group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function delete_sgroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("delete sensor group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        s_groupmodel.delete_sgroup(req).then(data => {
            if (!data || data.length === 0) {
                create_log("delete sensor group", log.log_level.info, responseList.error.error_no_data_delete.message, request_key, req)
                reject({ message: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code })
            }
            else {
                create_log("delete sensor group", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("delete sensor group", log.log_level.error, error.message, request_key, req)
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