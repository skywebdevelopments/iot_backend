var express = require('express');
var router = express.Router();


//configs
var authenticate = require('../auth/authentication_JWT');
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

    return new Promise((resolve, reject) => {
        usermodel.createUser({
            email: email,
            username: username,
            password: hashed_password,
            active: true,
        }).then((data) => {
            if (!data || data.length === 0) {
                create_log("create user", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${email} ]`, request_key, "not found")
                reject({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });

            }
            else {
                create_log("create user", log.log_level.info, responseList.success.success_creating_data.message, request_key, email)
                resolve({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });

            }
        }).catch((error) => {
            create_log("create user", log.log_level.error, error.message, request_key, email)
            reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        })
    })
}

//google user
function google_user(user, email, request_key) {
    return new Promise((resolve, reject) => {
        usermodel.GoogleUser(user)
            .then((token) => {
                    if (token === 'deactivated') {
                        create_log("login", log.log_level.error, responseList.error.error_notactive.message, request_key, email)
                        resolve({ data:token,status: responseList.error.error_notactive.message, code: responseList.error.error_notactive.code })
                    }
                    else {
                        create_log("login", log.log_level.info, responseList.success.sucess_login.message, request_key, email)
                        resolve({ data:token,status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
                    }

            }).catch((error) => {
                create_log("login", log.log_level.error, error.message, request_key, email)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })
}
function create_token(email, password, request_key) {


    let hashed_password = hash_pass(password)

    return new Promise((resolve, reject) => {
        usermodel.getUser(email, hashed_password)
            .then((user) => {
                if (!user || user.length === 0) {
                    create_log("login", log.log_level.error, `${responseList.error.error_no_user_found.message} - [ ${email} ]`, request_key, "not found")
                    reject({ status: responseList.error.error_no_user_found.message, code: responseList.error.error_no_user_found.code })
                }
                else {
                    if (user.active === false) {
                        create_log("login", log.log_level.error, responseList.error.error_notactive.message, request_key, user.email)
                        reject({ status: responseList.error.error_notactive.message, code: responseList.error.error_notactive.code })
                    }
                    else {
                        var token = authenticate.getToken(user); //create token using id and you can add other inf
                        usermodel.updateSession(user.id, token)
                            .then(() => {
                                create_log("login", log.log_level.info, responseList.success.sucess_login.message, request_key, user.email)
                                resolve({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
                            }).catch(err => {
                                create_log("login", log.log_level.error, err.message, request_key, user.email)
                                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
                            })
                    }
                }

            }).catch((error) => {
                create_log("login", log.log_level.error, error.message, request_key, "not found")
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}

function getall_users(req, request_key) {

    return new Promise((resolve, reject) => {

        usermodel.getallUsers()
            .then((users) => {

                if (!users) {
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

                if (!u_groups || u_groups.length === 0) {
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
                    resolve(u_group)
                }

            }).catch(error => {
                create_log("update users' permission", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}

function get_user_id(req, request_key) {

    return new Promise((resolve, reject) => {
        usermodel.get_user_id(req.body['id'])
            .then((user) => {
                //check if groupname is not found
                if (!user || user.length === 0) {

                    create_log("get user by id", log.log_level.error, responseList.error.error_invalid_payload.message, request_key, req)
                    reject({ status: responseList.error.error_invalid_payload.message, code: responseList.error.error_invalid_payload.code });
                }
                else {
                    resolve(user)
                }

            }).catch(error => {
                create_log("get user by id", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })
            })
    })

}

function update_permission(req, request_key) {


    let user_id = req.body['id']
    let permission = req.body['groupname']


    return new Promise((resolve, reject) => {

        get_usergroup(req, request_key, permission)
            .then((u_group) => {
                return usermodel.updatePermission(user_id, u_group.id)
            }).then((data) => {


                if (!data || data.length === 0 || !data[0]) {
                    create_log("update users' permission", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req)
                    reject({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
                }
                else {
                    // success
                    create_log("update users' permission", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                    resolve({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
                    //end
                }
            })
            .catch((err) => {
                reject(err)
            })





    })


}

function update_user(req, request_key) {
    let user_id = req.body['id']
    let username = req.body['username']
    let password = req.body['password']
    return new Promise((resolve, reject) => {

        hashed_password = hash_pass(password);
        usermodel.updateUser(user_id, username, hashed_password).then((data) => {

            if (!data || data.length === 0 || !data[0]) {
                create_log("update user", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req)
                reject({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            }
            // success
            create_log("update user", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
            resolve({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
            //end
        })
            .catch((err) => {
                reject(err)
            })





    })
}

function update_active_user(req, request_key) {
    let user_id = req.body['id']
    let active = req.body['active']

    return new Promise((resolve, reject) => {

        usermodel.updateActiveUser(user_id, active).then((data) => {

            if (!data || data.length === 0 || !data[0]) {
                create_log("update active user", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req)
                reject({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            }
            // success
            create_log("update active user", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
            resolve({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
            //end
        })
            .catch((err) => {
                reject(err)
            })





    })
}

function create_ugroup(req, groupname, roles, active, request_key) {

    return new Promise((resolve, reject) => {
        usermodel.createUgroup({
            groupname: groupname,
            roles: roles,
            active: active
        }).then((data) => {
            if (!data || data.length === 0) {
                create_log("create ugroup", log.log_level.error, `${responseList.error.error_already_exists.message} - [ ${groupname} ]`, request_key, req)
                reject({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });

            }
            else {
                create_log("create ugroup", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });

            }
        }).catch((error) => {
            create_log("create ugroup", log.log_level.error, error.message, request_key, req)
            reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        })
    })
}

function update_ugroup(req, request_key) {
    let { groupname, roles, active, rec_id } = req.body;
    return new Promise((resolve, reject) => {

        usermodel.updateUgroup({ groupname, roles, active, rec_id }).then((data) => {

            if (!data || !data[0]) {
                create_log("update ugroup", log.log_level.error, responseList.error.error_no_data_updated.message, request_key, req)
                reject({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
            } else
                if (data === "exists") {
                    create_log("update ugroup", log.log_level.error, responseList.error.error_already_exists.message, request_key, req)
                    reject({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });
                }
                else {
                    // success
                    create_log("update ugroup", log.log_level.info, responseList.success.success_updating_data.message, request_key, req)
                    resolve({ status: responseList.success.success_updating_data.message, code: responseList.success.code });
                    //end
                }
        })
            .catch((err) => {
                reject(err)
            })
    })
}


function delete_user(req, request_key) {
    return new Promise((resolve, reject) => {
        create_log("delete user", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        usermodel.deleteUser(req).then(data => {
            if (!data || data.length === 0) {
                create_log("delete user", log.log_level.info, responseList.error.error_no_data_delete.message, request_key, req)
                reject({ message: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code })
            }
            else {
                create_log("delete user", log.log_level.info, responseList.success.success_deleting_data.message, request_key, data.email)
                resolve(data)
            }
        }).catch((error) => {
            create_log("delete user", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function delete_Ugroup(req, request_key) {
    let { rec_id } = req.body;
    return new Promise((resolve, reject) => {
        create_log("delete user group", log.log_level.trace, responseList.trace.executing_query.message, request_key, req)
        usermodel.get_group_recid(rec_id).then(group => {
            if (group['groupname'] === 'public') {
                create_log("delete user group", log.log_level.error, responseList.error.error_delete_public.message, request_key, req)
                reject({ message: responseList.error.error_delete_public.message, code: responseList.error.error_delete_public.code })
            }
            else {
                usermodel.deleteUgroup({ rec_id }).then(data => {
                    if (!data || data.length === 0) {
                        create_log("delete user group", log.log_level.error, responseList.error.error_no_data_delete.message, request_key, req)
                        reject({ message: responseList.error.error_no_data_delete.message, code: responseList.error.error_no_data_delete.code })
                    }
                    else {
                        create_log("delete user group", log.log_level.info, responseList.success.success_deleting_data.message, request_key, req)
                        resolve(data)
                    }
                }).catch((error) => {
                    create_log("delete user group", log.log_level.error, error.message, request_key, req)
                    reject(error);
                })
            }
        }).catch((error) => {
            create_log("delete user group", log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })

}
//get all Ugroup roles
function getallRoles(req, request_key) {

    return new Promise((resolve, reject) => {

        usermodel.getallRoles()
            .then((grouproles) => {

                if (!grouproles) {
                    create_log("list group roles", log.log_level.warn, responseList.error.error_no_data.message, request_key, req)
                    reject({ status: responseList.error.error_no_data.message, code: responseList.error.error_no_data.code });
                }
                create_log("list group roles", log.log_level.info, responseList.success.sucess_data.message, request_key, req)
                resolve({ data: grouproles, status: responseList.success.sucess_data.message, code: responseList.success.code });

            }).catch(error => {
                create_log("list group roles", log.log_level.error, error.message, request_key, req)
                reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code })

            })
    })
}

//create a group role
function createRole(req, request_key) {

    return new Promise((resolve, reject) => {
        usermodel.createRole(req).then((data) => {
            if (!data || data.length === 0) {
                create_log("create group role", log.log_level.error, responseList.error.error_already_exists.message, request_key, req)
                reject({ status: responseList.error.error_already_exists.message, code: responseList.error.error_already_exists.code });

            }
            else {
                create_log("create group role", log.log_level.info, responseList.success.success_creating_data.message, request_key, req)
                resolve({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });

            }
        }).catch((error) => {
            create_log("create group role", log.log_level.error, error.message, request_key, req)
            reject({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
        })
    })
}

module.exports = {
    create_user,
    google_user,
    create_token,
    getall_users,
    getall_usergroups,
    update_permission,
    get_usergroup,
    update_user,
    update_active_user,
    create_ugroup,
    update_ugroup,
    get_user_id,
    delete_user,
    getallRoles,
    createRole,
    delete_Ugroup
}