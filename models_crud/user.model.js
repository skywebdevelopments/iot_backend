let db = require('../database/knex_connection')

function createUser(user) {

    return db.knex('user').insert(user)
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
            .fullOuterJoin('user_group', function () {
                this.on('user.id', '=', 'user_group.userId')
            })
            .fullOuterJoin('u_group', function () {
                this.on('u_group.id', '=', 'user_group.uGroupId')
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
            .fullOuterJoin('user_group', function () {
                this.on('user.id', '=', 'user_group.userId')
            })
            .fullOuterJoin('u_group', function () {
                this.on('u_group.id', '=', 'user_group.uGroupId')
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
            .fullOuterJoin('user_group', function () {
                this.on('u_group.id', '=', 'user_group.uGroupId')
            })
            .fullOuterJoin('user', function () {
                this.on('user.id', '=', 'user_group.userId')
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

//find user by userId
//returns user id if found
function findUser(user_id) {
    return new Promise((resolve, reject) => {
        db.knex('user')
            .where('id', '=', user_id)
            .select('user.id')
            .then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })

}


function deleteallPermissions(user_id) {
    return new Promise((resolve, reject) => {
        db.knex('user_group')
            .where({
                userId: user_id
            })
            .del()
            .then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

function addPermissions(user_id, u_group_id) {
    return new Promise((resolve, reject) => {
        db.knex('user_group')
            .insert({ userId: user_id, uGroupId: u_group_id })
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
    deleteallPermissions,
    addPermissions,
    createSession,
    updateSession,
    findUser
}