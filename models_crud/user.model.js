let db = require('../database/knex_connection')

function createUser(user) {

    return db.knex('user')
        .insert(user)
        .returning('*')
        .onConflict('email')
        .ignore()

}

//retrieve user using email and password
function getUser(email, password) {
    return new Promise((resolve, reject) => {
        db.knex('user')
            .where({
                email: email,
                password: password
            })
            .select('user.id', 'username', 'user.rec_id', 'u_group.groupname', 'u_group.roles')
            .leftJoin('u_group', function () {
                this.on('u_group.id', '=', 'user.uGroupId')
            })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })

}

function createSession(user_id, token) {
    return new Promise((resolve, reject) => {
        db.knex('session').insert({
            userId: user_id,
            active: true,
            token: token
        }).then((data) => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

function updateSession(user_id) {
    return new Promise((resolve, reject) => {
        db.knex('session')
            .where('userId', '=', user_id)
            .update({ active: false })
            .then((data) => {
                resolve(data)
            }).catch((error) => {
                reject(error)
            })
    })
}

function getallUsers() {

    return new Promise((resolve, reject) => {
        db.knex('user')
            .select('user.id', 'username', 'email', 'user.rec_id', 'u_group.groupname', 'u_group.roles')
            .join('u_group', function () {
                this.on('u_group.id', '=', 'user.uGroupId')
            })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })

}

function getallUsergroups() {

    return new Promise((resolve, reject) => {
        db.knex('u_group')
            .select('*')
            .join('user', function () {
                this.on('u_group.id', '=', 'user.uGroupId')
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
        db.knex('u_group')
            .where('groupname', '=', groupname)
            .select('*')
            .then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })

}

function updateUser(user_id, username, password) {

    return new Promise((resolve, reject) => {
        db.knex('user')
            .where('user.id', '=', user_id)
            .returning('*')
            .update({
                username: username,
                password: password
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
        db.knex('user')
            .where('user.id', '=', user_id)
            .returning('*')
            .update({
                active: active
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
        db.knex('user')
            .where('user.id', '=', user_id)
            .returning('*')
            .update({ uGroupId: u_group_id })
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

function deleteUgroup(ugroup_rec_id) {
    return new Promise((resolve, reject) => {
        db.knex('u_group')
            .where('u_group.rec_id', '=', ugroup_rec_id)
            .del()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
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
    createSession,
    updateSession,
    updateUser,
    updateActiveUser
}