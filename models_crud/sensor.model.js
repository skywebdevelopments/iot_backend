let db = require('../database/knex_connection')
let { uuid, isUuid } = require('uuidv4');

function create_sensor(req) {
    req.body['sensor_rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('sensor').insert(req.body).then(data => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
}

function create_sensor_logic(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        if (create_sensor_enjy(req) === true) {
            console.log('heyyyyyyyyyyy')
            db.knex('sensor').insert(req.body).then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
        }
        else {
            reject(create_sensor_enjy(req));
        }
    })
}


function create_sensor_enjy(req) {
    check = false
    db.knex('sensor_type')
        .select()
        .where('sensor_type.id', '=', req.body['sensorTypeId'])
        .then(function (data) {
            if (data.length !== 0) {
                console.log("true")
                check = true
            }
            else {
                console.log("false")
                check = false
            }
        }).catch((err) => {
            return (err);
        })
    return check;
}


function getAll() {
    return new Promise((resolve, reject) => {
        db.knex('sensor')
            .select('*')
            .innerJoin('mqtt_user', function () {
                this.on('sensor.mqttuserId', '=', 'mqtt_user.mqttuser_id')
            }).innerJoin('sensor_type', function () {
                this.on('sensor.sensorTypeId', '=', 'sensor_type.sensortype_id')
            })
            .then(function (rows) {
                console.log(rows)
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
            .where('sensor.sensor_rec_id', '=', req.body['sensor_rec_id'])
            .innerJoin('mqtt_user', function () {
                this.on('sensor.mqttuserId', '=', 'mqtt_user.mqttuser_id')
            }).innerJoin('sensor_type', function () {
                this.on('sensor.sensorTypeId', '=', 'sensor_type.sensortype_id')
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
            .where('sensor.sensor_rec_id', '=', req.body['sensor_rec_id'])
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
            .where('sensor.sensor_rec_id', '=', req.body['sensor_rec_id'])
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
    create_sensor,
    create_sensor_enjy,
    create_sensor_logic

}


