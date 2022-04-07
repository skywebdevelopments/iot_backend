let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');
let { dashboard } = require('../models/dashboard.iot');
const { userModel } = require('../models/user.iot.model');
const { messageModel } = require('../models/messages.iot');
// const { entityModel } = require('../models/entity.iot.model');


//create dashboard
function create_dashboard(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        dashboard.create(req.body).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


//get all mqttUsers 
function getDashboard(userId) {
    return new Promise((resolve, reject) => {
        userModel.findOne({
            where: {
                id: userId
            },
            attributes: ['username', 'email'],
            include: [{
                model: dashboard,
                attributes: ["cards"]
            }]
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    }).catch((error) => {
        reject(error);
    });
}

function getEntityMessages(req) {
    let entity_id = req.params.id;
    return new Promise((resolve, reject) => {
        messageModel.findAll({
            where: {
                entityId: entity_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}
function getEntityMessages_byId(id) {
    let entity_id = id;
    return new Promise((resolve, reject) => {
        messageModel.findAll({
            where: {
                entityId: entity_id
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    })
}


module.exports = {
    getDashboard,
    getEntityMessages,
    getEntityMessages_byId
}