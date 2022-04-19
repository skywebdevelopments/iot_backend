var Sequelize = require('sequelize');
var authenticate = require('../auth/authentication_JWT');
let { userModel } = require('../models/user.iot.model')
let { u_groupModel } = require('../models/u_group.iot.model')
let { sessionModel } = require('../models/session.iot.model')
let { GroupRoleModel } = require('../models/groupRole.iot.model')
const { Op } = require("sequelize");

function createUser(new_user) {

    return new Promise((resolve, reject) => {
        getUgroup('public').then(group => {
            userModel.findOne({
                where: {
                    email: new_user.email
                }
            }).then(user => {
                if (!user) {
                    userModel.create({
                        username: new_user.username,
                        password: new_user.password,
                        email: new_user.email,
                        active: true,
                        uGroupId: group.id,
                        dashboardId: 1
                    }).then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }
                else {
                    resolve([])
                }
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
    })

}
// google user
function GoogleUser(new_user) {
    return new Promise((resolve, reject) => {
        getUgroup('public').then(group => {
            userModel.findOne({
                where: {
                    googleID: new_user.googleId
                },
                include: {
                    model: u_groupModel
                }
            }).then(user => {
                if (!user) {
                    userModel.create({
                        username: new_user.name,
                        email: new_user.email,
                        googleID: new_user.googleId,
                        active: true,
                        uGroupId: group.id,
                        dashboardId: 1
                    }).then((user) => {
                        get_user_id(user.id).then((data) => {
                            resolve(data)
                        }).catch((err) => {
                            reject(err)
                        })
                    }).catch((err) => {
                        reject(err)
                    })
                }
                //already found
                else {
                    resolve(user)
                }
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
    })

}

//retrieve user using email and password
function getUser(email, password) {
    return new Promise((resolve, reject) => {

        userModel.findOne({
            where: {
                email: email,
                password: password
            },
            include: {
                model: u_groupModel
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}

//retrieve group using groupname
function getUgroup(groupname) {
    return new Promise((resolve, reject) => {
        u_groupModel.findOne({
            where: {
                groupname: groupname
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
}

function createSession(user_id, token) {
    return new Promise((resolve, reject) => {

        sessionModel.create({
            token: token,
            active: true,
            userId: user_id
        }).then((data) => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

function updateSession(user_id, token) {
    return new Promise((resolve, reject) => {
        sessionModel.findOne({
            where: {
                userId: user_id,
                active: true
            }
        }).then((session) => {
            if (session) {
                sessionModel.update({ active: false }, {
                    where: {
                        id: session.id
                    }
                })
            }
            return createSession(user_id, token)
        }).then((data) => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

function getallUsers() {

    return new Promise((resolve, reject) => {

        userModel.findAll({
            attributes: ['id', 'username', 'email', 'active']
            , include: [{
                model: u_groupModel
            }]
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}

function getallUsergroups() {

    return new Promise((resolve, reject) => {
        u_groupModel.findAll({
            include: [{
                model: userModel,
                as: 'users'
            }]
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}

//get userGroup by group name
function getUsergroup(groupname) {
    return new Promise((resolve, reject) => {
        u_groupModel.findOne({
            where: {
                groupname: groupname
            }
        }).then(data => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}


//get user by id
function get_user_id(user_id) {
    return new Promise((resolve, reject) => {
        userModel.findOne({
            where: {
                id: user_id
            }, include: [{
                model: u_groupModel
            }]
        }).then(data => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}

//get user group by rec_id
function get_group_recid(rec_id) {
    return new Promise((resolve, reject) => {
        u_groupModel.findOne({
            where: {
                rec_id: {
                    [Op.eq]: rec_id
                }
            }
        }).then(data => {
            console.log(data)
            resolve(data);
        }).catch((err) => {
            console.log(err)
            reject(err);
        })
    })

}

function updateUser(user_id, username, password) {

    return new Promise((resolve, reject) => {
        userModel.update({
            username: username,
            password: password
        },
            {
                where: {
                    id: user_id
                }
            })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

function updateActiveUser(user_id, active) {

    return new Promise((resolve, reject) => {
        userModel.update({
            active: active
        },
            {
                where: {
                    id: user_id
                }
            })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

function updatePermission(user_id, u_group_id) {
    return new Promise((resolve, reject) => {
        userModel.update({
            uGroupId: u_group_id
        },
            {
                where: {
                    id: user_id
                }
            })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

function createUgroup(ugroup) {

    return new Promise((resolve, reject) => {
        u_groupModel.findOne({
            where:
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('groupname')),
                    Sequelize.fn('lower', ugroup.groupname)
                )
        }).then(group => {
            if (!group) {
                u_groupModel.create(ugroup)
                    .then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
            }
            else {
                resolve([])
            }
        }).catch(err => {
            reject(err)
        })
    })


}

function updateUgroup(ugroup) {

    return new Promise((resolve, reject) => {
        UpdateAsscioateUserActive(ugroup, ugroup['active']).then(() => {
            u_groupModel.findOne({
                where:
                    Sequelize.where(
                        Sequelize.fn('lower', Sequelize.col('groupname')),
                        Sequelize.fn('lower', ugroup.groupname)
                    )
            }).then(group => {
                if (!group || ugroup.rec_id === group['rec_id']) {
                    u_groupModel.update(ugroup, {
                        where: {
                            rec_id: ugroup.rec_id
                        }
                    }).then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }
                else {
                    resolve("exists")
                }
            }).catch((error) => {
                reject(error)
            }).catch((error) => {
                reject(error)
            })
        })
    })

}

function deleteUser(req) {
    return new Promise((resolve, reject) => {
        userModel.findOne({
            where: {
                id: req.body['id']
            }
        }).then((data) => {
            userModel.destroy(
                {
                    where: {
                        id: req.body['id']
                    },
                }

            ).then(() => {
                resolve(data);
            }
            ).catch((err) => {
                reject(err);
            })
        })

    })
}

//return all group roles
function getallRoles() {

    return new Promise((resolve, reject) => {
        GroupRoleModel.findAll().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })

}

//create group role
function createRole(newrole) {

    return new Promise((resolve, reject) => {
        GroupRoleModel.findOne({
            where:
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('role')),
                    Sequelize.fn('lower', newrole.role)
                )
        }).then(grouprole => {
            if (!grouprole) {
                GroupRoleModel.create(newrole)
                    .then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
            }
            else {
                resolve([])
            }
        }).catch(err => {
            reject(err)
        })
    })


}

//make user unactive in case delete u_group or u_group active become false
function UpdateAsscioateUserActive(ugroup, active) {
    return new Promise((resolve, reject) => {
        u_groupModel.findOne(
            {
                where: {
                    rec_id: ugroup.rec_id
                },
                include: [{
                    model: userModel,
                    as: 'users'
                }]
            }
        ).then((data) => {
            if (data) {
                if (data['users'].length !== 0) {
                    for (let user of data['users']) {
                        userModel.update({ active: active },
                            {
                                where: {
                                    id: {
                                        [Op.eq]: user['id']
                                    }
                                },
                            }

                        ).then((data) => {
                            if (!data || data.length === 0 || data[0] === 0) {
                                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message })
                            };
                            resolve(data)
                        }).catch((error) => {
                            reject(error);
                        });
                    }
                }
                else
                    resolve(data)
            }
            else
                resolve(data)
        }).catch((error) => {
            reject(error);
        });
    })
}

//make user group in case delete u_group to be public
function UpdateAsscioateUserGroup(ugroup, groupid) {
    return new Promise((resolve, reject) => {
        u_groupModel.findOne(
            {
                where: {
                    rec_id: ugroup.rec_id
                },
                include: [{
                    model: userModel,
                    as: 'users'
                }]
            }
        ).then((data) => {
            if (data) {
                if (data['users'].length !== 0) {
                    for (let user of data['users']) {
                        userModel.update({ uGroupId: groupid },
                            {
                                where: {
                                    id: {
                                        [Op.eq]: user['id']
                                    }
                                },
                            }

                        ).then((data) => {
                            if (!data || data.length === 0 || data[0] === 0) {
                                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message })
                            };
                            resolve(data)
                        }).catch((error) => {
                            reject(error);
                        });
                    }
                }
                else
                    resolve(data)
            }
            else
                resolve(data)
        }).catch((error) => {
            reject(error);
        });
    })
}

//delete Ugroup
function deleteUgroup(ugroup) {
    return new Promise((resolve, reject) => {
        getUgroup('public').then(group => {
            UpdateAsscioateUserGroup(ugroup, group['id']).then(() => {
                u_groupModel.destroy(
                    {
                        where: {
                            rec_id: {
                                [Op.eq]: ugroup.rec_id
                            }
                        },
                    }

                ).then((data) => {
                    resolve(data);
                }
                ).catch((err) => {
                    reject(err);
                })
            }).catch((err) => {
                reject(err)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports = {
    createUser,
    GoogleUser,
    getUser,
    getallUsers,
    getallUsergroups,
    getUsergroup,
    get_group_recid,
    updatePermission,
    updateSession,
    updateUser,
    updateActiveUser,
    createUgroup,
    updateUgroup,
    get_user_id,
    deleteUser,
    getallRoles,
    createRole,
    deleteUgroup
}