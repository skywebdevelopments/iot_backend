let db = require('../database/knex_connection')
let { uuid, isUuid } = require('uuidv4');
const { GetSensortypes } = require('../controls/sensor_type.control');


function create_sensor_type(req) {
    req.body['sensortype_rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('sensor_type').insert(req.body).onConflict('type')
            .ignore().then(function (rows) {
                resolve(rows)
            }).catch((err) => {
                reject(err);
            })
    })
}


function getAll_senortype(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .select()
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function getSensor_type_byId(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .select()
            .where('sensor_type.sensortype_rec_id', '=', req.body['sensortype_rec_id'])
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function updateSensortype(req) {
    console.log(req.body)
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .where('sensor_type.sensortype_rec_id', '=', req.body['sensortype_rec_id'])
            .update(req.body)
            .then(data => {
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}


function deleteSensorAssigned(req) {
    db.knex('sensor_type')
        .select('sensortype_id')
        .where('sensor_type.sensortype_rec_id', '=', req.body['sensortype_rec_id'])
        .then(function (unit) {
            db.knex('sensor')
                .select('sensor_id')
                .where('sensor.sensorTypeId', '=', unit[0].sensortype_id)
                .then((data) => {
                    if (data.length !== 0) {
                        for (sensorr of data) {
                            db.knex('sensor')
                                .where('sensor.sensor_id', '=', sensorr.sensor_id)
                                .del().then(() => {
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

function deleteSensortypee(req) {
    return new Promise((resolve, reject) => {

        if (deleteSensortype(req) === "true") {

            db.knex('sensor_type')
                .where('sensor_type.sensortype_rec_id', '=', req.body['sensortype_rec_id'])
                .del()
                .then((data) => {
                    resolve(data);
                }).catch(err => {
                    reject(err)
                })
        }
        else {
            reject(deleteSensortype(req));
        }
    })
}


module.exports = {
    create_sensor_type,
    getAll_senortype,
    getSensor_type_byId,
    updateSensortype,
    deleteSensorAssigned,
    deleteSensortypee
}

