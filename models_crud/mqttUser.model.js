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
        db.knex('mqtt_user').insert(req.body)//.onConflict('username').ignore()
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



function delete_sensor(req) {
    db.knex('mqtt_user')
        .select('id')
        .where('mqtt_user.rec_id', '=', req.body['rec_id'])
        .then(function (unit) {
            db.knex('sensor')
                .select('id')
                .where('sensor.mqttUserId', '=', unit[0].id)
                .then((data) => {
                    if (data.length !== 0) {
                        for (sensorr of data) {
                            db.knex('sensor')
                                .where('sensor.id', '=', sensorr.id)
                                .del().then((data) => {
                                }).catch(err => {
                                    return err
                                })
                        }

                    }
                    return "true";
                }).catch(err => {
                    return err
                })
        }).catch(err => {
            return err
        })
        return "true";
}

function delete_mqttUsers(req) {
    return new Promise((resolve, reject) => {
        if (delete_sensor(req) === "true") {
            db.knex('mqtt_user')
                .where('mqtt_user.rec_id', '=', req.body['rec_id'])
                .del()
                .then((data) => {
                    resolve(data);
                }).catch(err => {
                    reject(err)
                })
        }
        else {
            reject(delete_sensor(req));
        }
    })
}
module.exports = {
    getAll_mqttUsers,
    create_mqttUsers,
    update_mqttUsers,
    delete_mqttUsers
}