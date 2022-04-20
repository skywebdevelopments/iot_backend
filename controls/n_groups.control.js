let n_groupmodel = require('../models_crud/n_groups.model')
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')
let { create_log } = require('./log.control')

function getAll_ngroups(request_key, req) {


    return new Promise((resolve, reject) => {
        create_log('list node group', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        n_groupmodel.getAll_ngroups().then(data => {
            if (!data || data.length === 0) {
                create_log('list node group', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('list node group', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('list node group', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function get_gnode_by_id(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('list node group with ID', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        n_groupmodel.get_gnode_by_id(req).then(data => {
            if (!data || data.length === 0) {
                create_log('list node group with ID', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('list node group with ID', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('list node group with ID', log.log_level.error, error.message, request_key, req)
            reject(error);

        })
    })
}

function create_ngroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("create node group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        n_groupmodel.create_ngroup(req).then(data => {
            if (!data || data.length === 0) {
                create_log("create node group", log.log_level.warn, responseList.error.error_no_data_created.message, request_key, req)
                reject({ code: responseList.error.error_no_data_created.code, message: responseList.error.error_no_data_created.message });
            }
            else {
                create_log("create node group", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("create node group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function nodeMap_to_ngroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log('map node to group', log.log_level.trace, responseList.trace.check_data_length.message, request_key, req)
        n_groupmodel.nodeMap_to_ngroup(req).then(data => {
            create_log(`query for group with ${req.body['group_rec_id']}`, log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
            create_log("map node to group", log.log_level.info, responseList.success.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log("map node to group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function update_ngroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("update node group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        n_groupmodel.update_ngroup(req).then(data => {
            if (!data || data[0] === 0 || data.length === 0) {
                create_log("update node group", log.log_level.info, responseList.error.error_no_data_updated.message, request_key, req)
                reject(
                    {
                        message: responseList.error.error_no_data_updated.message,
                        code: responseList.error.error_no_data_updated.code
                    })
            }
            else {
                create_log("update node group", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("update node group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function delete_ngroup(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("delete node group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        n_groupmodel.delete_ngroup(req).then(data => {
            if (!data || data.length === 0) {
                create_log("delete node group", log.log_level.info, responseList.error.error_no_data_delete.message, request_key, req)
                reject({ message: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code })
            }
            else {
                create_log("delete node group", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("delete node group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function delete_ngroup_relation(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("delete node group relation", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        n_groupmodel.delete_relation_ngroup(req).then(data => {
            if (!data || data.length === 0) {
                create_log("delete node group relation", log.log_level.info, responseList.error.error_no_data_delete.message, request_key, req)
                reject({ message: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code })
            }
            else {
                create_log("delete node group relation", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
                resolve(data)
            }
        }).catch((error) => {
            create_log("delete node group relation", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

module.exports = {
    create_ngroup,
    getAll_ngroups,
    get_gnode_by_id,
    nodeMap_to_ngroup,
    update_ngroup,
    delete_ngroup,
    delete_ngroup_relation
}