let db = require('../database/knex_connection');
let { uuid } = require('uuidv4');
let { nodeModel } = require('../models/node.iot.model');
let { mqtt_userModel } = require('../models/mqttUser.iot.model');
let { entityModel } = require('../models/entity.iot.model');
let { Op } = require("sequelize");


function create_node(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        nodeModel.create(req.body).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


function getAll() {
    return new Promise((resolve, reject) => {
        nodeModel.findAll(
            {
                include: [{
                    model: mqtt_userModel,
                    required: true,
                    attributes: ['username', 'id']
                },
                {
                    model: entityModel,
                    as: 'entity'
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

function getnodebyId(req) {
    let node_id = req.body['rec_id'];
    return new Promise((resolve, reject) => {
        nodeModel.findOne({
            where: {
                rec_id: node_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}

function Update_node(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        nodeModel.update(req.body,
            {
                where: {
                    rec_id: req.body['rec_id']

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

function delete_node(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        nodeModel.destroy(
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
    getnodebyId,
    Update_node,
    delete_node,
    create_node
}


