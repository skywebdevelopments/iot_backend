let db = require('../database/knex_connection')

function createUser(req) {

    return db.knex('user').insert(req.body)
        .onConflict('email')
        .ignore()

}

function createToken(email, password) {
    console.log('====================================');
    console.log(email, password);
    console.log('====================================');
    return db.knex('user')
        .where({
            email: email,
            password: password
        })
        .select('*')
        .fullOuterJoin('user_group', function () {
            this.on('user.id', '=', 'user_group.userId')
        })
        .fullOuterJoin('u_group', function () {
            this.on('u_group.id', '=', 'user_group.uGroupId')
        })

}

//missing group name for each user 
function getallUsers() {

    return db.knex('user')
        .select('user.id', 'username', 'email', 'user.rec_id')
        .fullOuterJoin('user_group', function () {
            this.on('user.id', '=', 'user_group.userId')
        })
        .fullOuterJoin('u_group', function () {
            this.on('u_group.id', '=', 'user_group.uGroupId')
        })


    db.knex.raw('(SELECT u.id ,u.username ,u.email ,u.rec_id ,ug.groupname ' +
        '  FROM "user" AS  u' +
        ' full outer join "user_group" ' +
        ' ON u."id" = "user_group"."userId"' +
        ' full outer join u_group as ug  ' +
        ' ON ug."id" = "user_group"."uGroupId" )')

}

function getallUsergroups() {

    return db.knex('u_group')
        .select('*')
        .fullOuterJoin('user_group', function () {
            this.on('u_group.id', '=', 'user_group.uGroupId')
        })
        .fullOuterJoin('user', function () {
            this.on('user.id', '=', 'user_group.userId')
        })
}

function getUsergroup(groupname) {
    return db.knex('u_group')
        .where('groupname', '=', groupname)
        .select('*')
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

module.exports = {
    createUser,
    createToken,
    getallUsers,
    getallUsergroups,
    getUsergroup,
    deleteallPermissions,
    addPermissions
}