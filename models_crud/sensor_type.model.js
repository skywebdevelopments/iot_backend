let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');
let { SensorTypeModel } = require('../models/sensortype.iot.model');
let { Op } = require("sequelize");


function create_sensor_type(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        SensorTypeModel.create(req.body).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


function getAll_senortype(req) {
    return new Promise((resolve, reject) => {
        SensorTypeModel.findAll().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}

function getSensor_type_byId(req) {
    let sensorType_id = req.body['rec_id'];
    return new Promise((resolve, reject) => {
        SensorTypeModel.findOne({
            where: {
                rec_id: sensorType_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}

function updateSensortype(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        SensorTypeModel.update(req.body,
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },
            }

        ).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


function deleteSensortypee(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        SensorTypeModel.destroy(
            {
                where: {
                    rec_id: {
                        [Op.eq]: rec_id
                    }
                },
            }

        ).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });

    })
}


module.exports = {
    create_sensor_type,
    getAll_senortype,
    getSensor_type_byId,
    updateSensortype,
  
    deleteSensortypee
}

