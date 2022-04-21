let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');
let { entityModel } = require('../models/entity.iot.model');
let { nodeModel } = require('../models/node.iot.model');
let { entity_TypeModel } = require('../models/entity_types.iot.model');
let { Op } = require("sequelize");


function create_entity(req) {

    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        entityModel.create(req.body).then((data) => {
            console.log(data)
            resolve(data);
        }).catch((error) => {
            console.log(error)
            reject(error);
        });
    })
}


function getAll_entity(req) {
    return new Promise((resolve, reject) => {
        entityModel.findAll(
            {
                include: [{
                    model: nodeModel
                }, {
                    model: entity_TypeModel
                }]
            }
        ).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}

function getentity_byId(req) {
    let entity_id = req.body['rec_id'];
    return new Promise((resolve, reject) => {
        entityModel.findOne({
            where: {
                rec_id: entity_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}

function update_entity(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        entityModel.update(req.body,
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


function delete_entity(req) {
    let rec_id = req.body['rec_id']
    return new Promise((resolve, reject) => {
        entityModel.destroy(
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

function countrow() {
    return new Promise((resolve, reject) => {
        entityModel.count({}
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


function getAll_entities_types(req) {
    return new Promise((resolve, reject) => {
        entity_TypeModel.findAll().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}

module.exports = {
    create_entity,
    getAll_entity,
    getentity_byId,
    update_entity,
    delete_entity,
    countrow,
    getAll_entities_types

}

