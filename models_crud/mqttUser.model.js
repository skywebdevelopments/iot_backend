let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');
let { mqtt_userModel } = require('../models/mqttUser.iot.model');
let { Op } = require("sequelize");

//create mqttUser
function create_mqttUsers(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        mqtt_userModel.create(req.body).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


//get all mqttUsers 
function getAll_mqttUsers() {
    return new Promise((resolve, reject) => {
        mqtt_userModel.findAll().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}


//update mqttUser
function update_mqttUsers(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        mqtt_userModel.update(req.body,
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


function delete_mqttUsers(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        mqtt_userModel.destroy(
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
    getAll_mqttUsers,
    create_mqttUsers,
    update_mqttUsers,
    delete_mqttUsers
}