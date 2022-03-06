let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');


//get all mqttUsers 
function getAll_mqttUsers() {
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user').select('*')
            .then(function (rows) {
                resolve(rows)
            }).catch((err) => {
                reject(err);

            })
    })
}

//create mqttUser
function create_mqttUser(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user').insert(req.body).onConflict('username').ignore()
            .then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}
module.exports = {
    getAll_mqttUsers,
    create_mqttUser
}