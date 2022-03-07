let db = require('../database/knex_connection')
let { uuid, isUuid } = require('uuidv4');

function create_sensor(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('sensor').insert(req.body).then(data => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
}



function getAll(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor')
            .select('*','sensor_type.active as sensor_type_active ')
            .innerJoin('mqtt_user', function () {
                this.on('sensor.mqttUserId', '=', 'mqtt_user.id')
            }).innerJoin('sensor_type', function () {
                this.on('sensor.sensorTypeId', '=', 'sensor_type.id')
            })
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function getSensorbyId(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor')
            .select()
            .where('sensor.rec_id', '=', req.body['rec_id'])
            .innerJoin('mqtt_user', function () {
                this.on('sensor.mqttUserId', '=', 'mqtt_user.id')
            }).innerJoin('sensor_type', function () {
                this.on('sensor.sensorTypeId', '=', 'sensor_type.id')
            })
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function UpdateSensor(req) {
    console.log(req.body)
    return new Promise((resolve, reject) => {
        db.knex('sensor')
            .where('sensor.rec_id', '=', req.body['rec_id'])
            .update(req.body)
            .then(data => {
                console.log(data)
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}

function deleteSensor(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor')
            .where('sensor.rec_id', '=', req.body['rec_id'])
            .del()
            .then(data => {
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}



module.exports = {
    getAll,
    getSensorbyId,
    UpdateSensor,
    deleteSensor,
    create_sensor
}


