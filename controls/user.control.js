var express = require('express');
var router = express.Router();
let { uuid } = require('uuidv4');


//configs
var authenticate = require('../auth/authentication_JWT');
var secret = require('../config/sercret.json');
var responseList = require('../config/response.code.json');
var cryptojs = require('crypto-js');
let { log } = require('../config/app.conf.json')

//middleware
let { create_log } = require('../controls/log.control')

//database models
let usermodel = require('../models_crud/user.model');

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

function create_user(email, username, password, request_key) {


    let hashed_password = hash_pass(password)
    let rec_id = uuid()

    return new Promise((resolve, reject) => {
        usermodel.createUser({
            email: email,
            username: username,
            password: hashed_password,
            rec_id: rec_id
        }).then((data) => {
            if (data.rowCount === 0) {
                create_log("create user", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${email} ]`, request_key, 0)
                reject({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });

            }
            else {
                create_log("create user", log.log_level.info, responseList.success.success_creating_data.message, request_key, 1)
                resolve({ status: responseList.success.success_creating_data.message, code: responseList.success.code });

            }
        }).catch((error) => {
            create_log("create user", log.log_level.error, error.message, request_key, 0)
            reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        })
    })
}

function create_token(email, password, request_key) {


    let hashed_password = hash_pass(password)

    return new Promise((resolve, reject) => {

        usermodel.getUser(email, hashed_password)
            .then((data) => {
                if (data.length === 0) {
                    create_log("login", log.log_level.error, `${responseList.error.error_no_user_found.message} - [ ${email} ]`, request_key, 0)
                    reject({ status: responseList.error.error_no_user_found.message, code: responseList.error.error_no_user_found.code })
                }
                else {
                    let user = {
                        roles: []
                    };
                    for (let u of data) {
                        user.id = u.id,
                            user.username = u.username,
                            user.roles.push(u.roles)
                    }

                    var token = authenticate.getToken(user); //create token using id and you can add other inf
                    usermodel.updateSession(user.id)
                    usermodel.createSession(user.id, token)
                        .then(() => {
                            create_log("login", log.log_level.info, responseList.success.sucess_login.message, request_key, user.id)
                            resolve({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
                        })
                }

            })
            .catch((error) => {
                create_log("login", log.log_level.error, error.message, request_key, 0)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}

function getall_users(req, request_key) {

    return new Promise((resolve, reject) => {

        usermodel.getallUsers()
            .then((users) => {

                if (!users || users.rowCount === 0) {
                    create_log("list users", log.log_level.warn, responseList.error.error_no_data.message, request_key, req)
                    reject({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
                }
                create_log("list users", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve({ data: users, status: responseList.success.sucess_data.message, code: responseList.success.code });

            }).catch(error => {
                create_log("list users", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

            })
    })
}

function getall_usergroups(req, request_key) {

    return new Promise((resolve, reject) => {

        usermodel.getallUsergroups()
            .then((u_groups) => {

                if (!u_groups || u_groups.rowCount === 0) {
                    create_log("list u_groups", log.log_level.warn, responseList.error.error_no_data.message, request_key, req)
                    reject({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });

                }
                // success
                create_log("list u_groups", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve({ data: u_groups, status: responseList.success.sucess_data.message, code: responseList.success.code });
                //end
            }).catch(error => {
                create_log("list u_groups", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

            })
    })
}

function get_usergroup(req, request_key, groupname) {

    return new Promise((resolve, reject) => {

        usermodel.getUsergroup(groupname)
            .then((u_group) => {
                //check if groupname is not found
                if (!u_group || u_group.length === 0) {

                    create_log("update users' permission", log.log_level.error, responseList.error.error_invalid_payload.message, request_key, req)
                    reject({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
                }
                else {
                    resolve(u_group[0])
                }

            }).catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}

function add_permissions(req, request_key, userId, uGroupId) {

    return new Promise((resolve, reject) => {

        usermodel.addPermissions(userId, uGroupId)
            .then((data) => {
                //check if groupname is not found
                if (!data || data.length === 0) {

                    create_log("update users' permission", log.log_level.error, responseList.error.error_invalid_payload.message, request_key, req)
                    reject({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
                }
                else {
                    resolve(data)
                }

            }).catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}


function deleteall_permissions(req, request_key) {

    let user_id = req.body['userid']

    return new Promise((resolve, reject) => {

        usermodel.deleteallPermissions(user_id).then(() => {
            create_log("update users' permission", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
            resolve()
        }).catch((error) => {
            create_log("update users' permission", log.log_level.error, responseList.error.error_no_data_delete, request_key, req)
            reject({ status: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code });
        })
    })
}

function update_permission(req, request_key) {


    let user_id = req.body['userid']
    let permissions = req.body['permissions']


    return new Promise((resolve, reject) => {

        deleteall_permissions(req, user_id)
            .then(() => {

                for (let permission of permissions) {

                    get_usergroup(req, request_key, permission)
                        .then((u_group) => {
                            add_permissions(req, request_key, user_id, u_group.id)
                        })
                }
                // success
                create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                resolve({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
                //end
            })
            .catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

            })



    })


}

//return true if user found else false
function find_user(user_id) {
    return new Promise((resolve, reject) => {
        usermodel.findUser(user_id).then((data) => {
            if (data.length === 0) {
                reject(data)
            }
            else {
                resolve(data)
            }
        }).catch((err) => {
            reject(err)
        })
    })

}

module.exports = {
    create_user,
    create_token,
    getall_users,
    getall_usergroups,
    update_permission,
    get_usergroup,
    find_user
}