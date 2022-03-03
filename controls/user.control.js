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


function create_user(req, res) {
    let request_key = uuid();
    let password = req.body['password']
    let email = req.body['email']

    //Hashing password from req body before inserting in DB
    var hash = cryptojs.SHA256(password);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
    //end

    req.body['password'] = hashInBase64
    req.body['rec_id'] = uuid()

    return new Promise((resolve, reject) => {
        usermodel.createUser(req).then((data) => {
            if (data.rowCount === 0) {
                create_log("create user", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${email} ]`, request_key, 0)
                res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
                reject(data);
            }
            else {
                create_log("create user", log.log_level.info, responseList.success.success_creating_data.message, request_key, 1)
                res.send({ status: responseList.success.success_creating_data.message, code: responseList.success.code });
                resolve(data);
            }
        }).catch((error) => {
            create_log("create user", log.log_level.error, error.message, request_key, 0)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
            reject(error)
        })
    })
}

function getall_users(req, res) {

    let request_key = uuid();
    return new Promise((resolve, reject) => {

        usermodel.getallUsers().then((users) => {
            // 2. return data in a response.
            if (!users || users.rowCount === 0) {
                create_log("list users", log.log_level.warn, responseList.error.error_no_data.message, request_key, req)
                res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
                reject(users);
            }
            // send the response.
            create_log("list users", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            res.send({ data: users, status: responseList.success.sucess_data.message, code: responseList.success.code });
            resolve(users);
            //end
        }).catch(error => {
            create_log("list users", log.log_level.error, error.message, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            reject(error);
        })
    })
}

function getall_usergroups(req, res) {

    let request_key = uuid();
    return new Promise((resolve, reject) => {

        usermodel.getallUsergroups().then((u_groups) => {
            // 2. return data in a response.
            if (!u_groups || u_groups.rowCount === 0) {
                create_log("list u_groups", log.log_level.warn, responseList.error.error_no_data.message, request_key, req)
                res.send({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
                reject(u_groups);
            }
            // send the response.
            create_log("list u_groups", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            res.send({ data: u_groups, status: responseList.success.sucess_data.message, code: responseList.success.code });
            resolve(u_groups);
            //end
        }).catch(error => {
            create_log("list u_groups", log.log_level.error, error.message, request_key, req)
            res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            reject(error);
        })
    })
}

function create_token(req, res) {

    const { email, password } = req.body;

    //Hashing password from req body before finding in DB
    var hash = cryptojs.SHA256(password);
    var hashInBase64 = cryptojs.enc.Base64.stringify(hash);
    //end

    usermodel.createToken(email, hashInBase64).then((user) => {
        res.send(user);
    })

}

function deleteall_permissions(req, res) {
    let request_key = uuid();
    let user_id = req.body['userid']
    return new Promise((resolve, reject) => {

        usermodel.deleteallPermissions(user_id).then(() => {
            create_log("update users' permission", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
            resolve()
        }).catch((error) => {
            create_log("update users' permission", log.log_level.error, responseList.error.error_no_data_delete, request_key, req)
            reject(error);
        })
    })
}

function get_usergroup(req, res, groupname) {
    let request_key = uuid();
    return new Promise((resolve, reject) => {

        usermodel.getUsergroup(groupname)
            .then((u_group) => {
                //check if groupname is not found
                if (!u_group || u_group.length === 0) {

                    create_log("update users' permission", log.log_level.error, responseList.error.error_no_data.message, request_key, req)
                    reject(responseList.error.error_no_data)
                }
                else {
                    resolve(u_group[0])
                }

            }).catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                reject(error);
            })
    })

}
function update_permission(req, res) {
    let request_key = uuid();

    let user_id = req.body['userid']
    let permissions = req.body['permissions']

    return new Promise((resolve, reject) => {

        deleteall_permissions(req, res, user_id)
            .then(() => {
                //check for newly added permissions and add them to user_group table
                for (let permission of permissions) {
                    //find new added permission in u_group table
                    get_usergroup(req, res, permission)
                        .then((u_group) => {
                            usermodel.addPermissions(user_id, u_group.id)
                        }).catch(error => {
                            console.log('====================================');
                            console.log(error.message);
                            console.log('====================================');

                            res.send({ status: error.message, code: responseList.error.error_general.code })
                            reject(error);
                        })
                }

            }).then(() => {
                create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                res.send({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
                resolve();
            })
            .catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
                reject(error);
            })



    })


}

module.exports = {
    create_user,
    create_token,
    getall_users,
    getall_usergroups,
    update_permission
}