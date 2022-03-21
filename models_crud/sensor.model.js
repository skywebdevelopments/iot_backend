let db = require('../database/knex_connection');
let { uuid } = require('uuidv4');
let { sensorModel } = require('../models/sensor.iot.model');
let { mqtt_userModel } = require('../models/mqttUser.iot.model');
let { SensorTypeModel } = require('../models/sensortype.iot.model');
let { Op } = require("sequelize");


function create_sensor(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        sensorModel.create(req.body).then((data) => {
            console.log("1");
            resolve(data);
        }).catch((error) => {
            console.log("2");
            reject(error);
        });
    })
}


function getAll() {
    return new Promise((resolve, reject) => {
        sensorModel.findAll(
            {
                include: [{
                    model: mqtt_userModel,
                    required: true,
                    attributes: ['username', 'id']
                },
                {
                    model: SensorTypeModel,
                    required: true,
                    attributes: ['type', 'id']
                }]
            }
        ).then((data) => {
            resolve(data);
            //end
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}

function getSensorbyId(req) {
    let sensor_id = req.body['rec_id'];
    return new Promise((resolve, reject) => {
        sensorModel.findOne({
            where: {
                rec_id: sensor_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}

function UpdateSensorr(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        sensorModel.update(req.body,
            {
                where: {
                    rec_id:req.body['rec_id']
                
                },
            }

        ).then((data) => {
            console.log(data)
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}

function deleteSensor(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        sensorModel.destroy(
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
    getAll,
    getSensorbyId,
    UpdateSensorr,
    deleteSensor,
    create_sensor
}


