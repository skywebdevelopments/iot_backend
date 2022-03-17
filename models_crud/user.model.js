var Sequelize = require('sequelize');

let { userModel } = require('../models/user.iot.model')
let { u_groupModel } = require('../models/u_group.iot.model')
let { sessionModel } = require('../models/session.iot.model')


function createUser(new_user) {

    return new Promise((resolve, reject) => {
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
                    uGroupId: 4
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
            attributes: ['id', 'username', 'email','active']
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

        u_groupModel.findOne({
            where:
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('groupname')),
                    Sequelize.fn('lower', ugroup.groupname)
                )
        }).then(group => {
            if (!group) {
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
        })
    })

}



module.exports = {
    createUser,
    getUser,
    getallUsers,
    getallUsergroups,
    getUsergroup,
    updatePermission,
    updateSession,
    updateUser,
    updateActiveUser,
    createUgroup,
    updateUgroup,
    get_user_id
}