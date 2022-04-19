let entity = require('../models_crud/entity.model')
var { log } = require('../config/app.conf.json')
let { uuid } = require('uuidv4');
var responseList = require('../config/response.code.json')
let { create_log } = require('./log.control')


function Create_entity(req, request_key) {
    return new Promise((resolve, reject) => {
        entity.create_entity(req).then((data) => {
            create_log("create entity", log.log_level.trace, responseList.trace.executing_query.message, request_key, req);
            if (data.length === 0) {
                create_log("create entity", log.log_level.error, responseList.error.error_already_exists.message, request_key, req);
                resolve(data);
            }
            else {
                create_log("create entity", log.log_level.info, responseList.success.success_creating_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("create entity", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function GetEntity(req, res) {
    let request_key = uuid();
    return new Promise((resolve, reject) => {
        entity.getAll_entity().then((data) => {
            if (data.length === 0) {
                create_log('list entity', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data)
            }
            else {
                create_log("List entity", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data)
            }

        }).catch((error) => {
            create_log("List entity", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })

}

function Getentity_byId(req, request_key) {
    return new Promise((resolve, reject) => {
        entity.getentity_byId(req).then((data) => {
            if (data.length === 0) {
                create_log('list entity by Id', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("List entity by Id", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List entity by Id", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function Update_entityy(req, request_key) {
    return new Promise((resolve, reject) => {
        entity.update_entity(req).then((data) => {
            if (data.length === 0) {
                create_log("update entity", log.log_level.error, responseList.error.error_no_data_updated, request_key, req);
                resolve(data);
            }

            else {
                create_log("update entity", log.log_level.info, responseList.success.success_updating_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("Update entity", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function Delete_entity(req, request_key) {


    return new Promise((resolve, reject) => {
        entity.delete_entity(req).then((data) => {

            create_log("delete entity", log.log_level.trace, responseList.trace.executing_query.message, request_key, req);
            if (data.length === 0) {

                create_log("delete entity", log.log_level.error, responseList.error.error_no_data_updated, request_key, req);
                resolve(data);
            }
            else {
                create_log("delete entity", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("delete entity", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function Getcount(req, request_key) {
    return new Promise((resolve, reject) => {
        entity.countrow().then((data) => {
            if (!data || data.length === 0 || data[0] === 0) {
                create_log('Entity', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("Entity", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("Entity", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

module.exports = {
    Create_entity,
    GetEntity,
    Getentity_byId,
    Update_entityy,
    Delete_entity,
    Getcount

}