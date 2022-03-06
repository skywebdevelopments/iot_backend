let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');
var responseList = require('../config/response.code.json')

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
function create_mqttUsers(req) {
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

//update mqttUser
function update_mqttUsers(req) {
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user')
            .where('mqtt_user.rec_id', '=', req.body['rec_id'])
            .update(req.body).then((data) => {
                resolve(data);
            }
            ).catch((err) => {
                reject(err);
            })
    })
}

//delete sensor asscioated by mqttUser
function delete_sensor(row) {
    db.knex('sensor')
        .where('sensor.mqttUserId', '=', row[0].id)
        .del()
        .then(() => {
            return "true"
        }).catch(err => {
            return err
        })
    return "true"
}

//delete mqttUser
function delete_mqttUsers(req) {
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user')
            .select('id')
            .where('mqtt_user.rec_id', '=', req.body['rec_id'])
            .then(function (row) {
                if (row.length !== 0) {
                    if (delete_sensor(row) === "true") //delete asscioated sensors
                    {
                        db.knex('mqtt_user')
                            .where('mqtt_user.rec_id', '=', req.body['rec_id'])
                            .del()
                            .then((data) => {
                                resolve(data)
                            }).catch(err => {
                                reject(err)
                            })
                    }
                    else
                        reject(delete_sensor(row))
                }
                else {
                    resolve(row);
                }
            }).catch(err => {
                reject(err)
            })

    })
}
module.exports = {
    getAll_mqttUsers,
    create_mqttUsers,
    update_mqttUsers,
    delete_mqttUsers
}