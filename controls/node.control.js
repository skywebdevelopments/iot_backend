let node = require('../models_crud/node.model')
var { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var responseList = require('../config/response.code.json')
let { create_log } = require('./log.control')
var cryptojs = require('crypto-js');

function Createnode(req, request_key) {

    req.body['ota_password'] = hash_pass(req.body['ota_password'])
    req.body['ap_password'] = hash_pass(req.body['ap_password'])
    create_log("create node", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)

    console.log('***********************************************control***********')
    console.log(req.body)
    console.log('***********************************************control***********')
    return new Promise((resolve, reject) => {
        node.create_node(req).then((data) => {
            if (!data || data.length === 0 || data[0] === 0) {
                create_log('Create node', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
                return;
            }
            else {
                create_log("Create node", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve(data);
                return;
            }

        }).catch((error) => {
            create_log("Create node", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

// parameters: password
// hashes password sha256
// returns: string
function hash_pass(password) {
    //Hashing password from req body before inserting in DB
    var hash = cryptojs.SHA256(password);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
    return hashInBase64
    //end
}

function Getnodes(req, request_key) {
    return new Promise((resolve, reject) => {
        node.getAll().then((data) => {
            if (!data || data.length === 0 || data[0] === 0) {
                create_log('list node', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("List node", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List node", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function GetnodebyId(req, request_key) {
    return new Promise((resolve, reject) => {
        node.getnodebyId(req).then((data) => {
            if (!data || data.length === 0 || data[0] === 0) {
                create_log('list node by Id', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log("List node by Id", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log("List node by Id", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function Updatenode(req, request_key) {

    return new Promise((resolve, reject) => {
        node.Update_node(req).then((data) => {

            if (!data || data.length === 0 || data[0] === 0) {
                create_log("update node", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req);
                reject(data);
            }
            else {
                create_log("update node", log.log_level.info, responseList.success.success_updating_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("Update node", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function Deletenode(req, request_key) {
    return new Promise((resolve, reject) => {
        node.delete_node(req).then((data) => {
            create_log("delete node", log.log_level.trace, responseList.trace.executing_query.message, request_key, req);
            if (!data || data.length === 0 || data[0] === 0) {
                create_log("delete node", log.log_level.error, responseList.error.error_no_data_updated, request_key, req);
                resolve(data);
            }

            else {
                create_log("delete node", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req);
                resolve(data);
            }

        }).catch((error) => {
            create_log("delete node", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })

}

function Getcount(req, request_key) {
    return new Promise((resolve, reject) => {
        node.countrow().then((data) => {
            if (!data || data.length === 0 || data[0] === 0) {
                create_log(' Node', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                resolve(data);
            }
            else {
                create_log(" Node", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve(data);
            }

        }).catch((error) => {
            create_log(" Node", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

module.exports = {
    Getnodes,
    GetnodebyId,
    Updatenode,
    Deletenode,
    Createnode,
    Getcount

}
