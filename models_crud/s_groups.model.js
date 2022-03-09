let db = require('../database/knex_connection')
//models
const { s_groupModel } = require('../models/s_group.iot.model');
let { sensorModel } = require('../models/sensor.iot.model')
//end
var Sequelize = require('sequelize');
const { Op } = require("sequelize");
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')


//get all s_groups include asscioated sensors 
function getAll_sgroups() {
    return new Promise((resolve, reject) => {
        s_groupModel.findAll({
            include: {
                model: sensorModel,
                as: "sensor"
            }
        }).then((data) => {
            resolve(data)
        }).catch((err) => {
            reject(err);

        })
    })
}


//get asscoiated sensors by s_group id
function get_gSensor_by_id(req) {
    return new Promise((resolve, reject) => {
        s_groupModel.findOne({
            include: {
                model: sensorModel,
                as: "sensor"
            }
            ,
            where: {
                id: req.body['groupId']
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    })
}

//create s_group
function create_sgroup(req) {
    return new Promise((resolve, reject) => {
        s_groupModel.findOne(
            {
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('name')),
                    Sequelize.fn('lower', req.body['name'])
                )
            }
        ).then((group) => {
            if (!group) {
                s_groupModel.create(req.body).then((data) => {
                    resolve(data)
                }).catch((error) => {
                    reject(error)
                });
            }
            else {
                reject({ code: responseList.error.error_already_exists.code, message: responseList.error.error_already_exists.message });
            }
        }).catch((error) => {
            reject(error)
        })
    })
}

//Map sensor to s_group by sensorId and group_rec_id
function sensorMap_to_sgroup(req) {
    return new Promise((resolve, reject) => {
        s_groupModel.findOne({
            include: {
                model: sensorModel,
                as: "sensor"
            }
            ,
            where: {
                rec_id: req.body['rec_id']
            }
        }).then((data) => {
            if (!data || data.length === 0) {
                reject(
                    {
                        code: responseList.error.error_no_data.code,
                        message: responseList.error.error_no_data.message
                    }
                );
            }
            return data.addSensor(req.body['sensorId'])
        }).then(() => {
            resolve({
                code: responseList.success.code,
                message: responseList.success.message
            });
        }).catch((error) => {
            reject(error)
        });
    })
}


//update s_group 
function update_sgroup(req) {
    return new Promise((resolve, reject) => {
            update_sensor_active(req,req.body['active']).then(()=>{
                s_groupModel.findOne(
                    {
                        where: Sequelize.where(
                            Sequelize.fn('lower', Sequelize.col('name')),
                            Sequelize.fn('lower', req.body['name'])
                        )
                    }
                ).then((group) => {
                    if (!group || req.body['rec_id'] === group['rec_id']) {
                        s_groupModel.update(req.body,
                            {
                                where: {
                                    rec_id: {
                                        [Op.eq]: req.body['rec_id']
                                    }
                                },
        
                            }
        
                        ).then((data) => {
                            resolve(data)
                        }).catch((error) => {
                            reject(error)
                        });
                    }
                    else {
                        reject({ code: responseList.error.error_already_exists.code, message: responseList.error.error_already_exists.message });
                    }
                }).catch((error) => {
                    reject(error)
                })
            }).catch((error)=>{
                reject(error)
            })
    })
}


//make sensor unactive in case delete s_group or s_group active become false
function update_sensor_active(req,active) {
    return new Promise((resolve, reject) => {
        s_groupModel.findOne(
            {
                where: {
                    rec_id: req.body['rec_id']
                },
                include: [{
                    model: sensorModel,
                    as: 'sensor'
                }]
            }
        ).then((data) => {
            if (data) {
                if (data['sensor'].length !== 0) {
                    for (let sensor of data['sensor']) {
                        sensorModel.update({ active: active },
                            {
                                where: {
                                    id: {
                                        [Op.eq]: sensor['id']
                                    }
                                },
                            }

                        ).then((data) => {
                            if (!data || data.length === 0 || data[0] === 0) {
                                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message })
                            };
                            resolve(data)
                        }).catch((error) => {
                            reject(error);
                        });
                    }
                }
                else {
                    resolve(data)
                }
            }
        }).catch((error) => {
            reject(error);
        });
    })
}

//delete s_group 
function delete_sgroup(req) {
    return new Promise((resolve, reject) => {
        update_sensor_active(req,false).then(() => {
                s_groupModel.destroy(
                    {
                        where: {
                            rec_id: {
                                [Op.eq]: req.body['rec_id']
                            }
                        },
                    }

                ).then((data) => {
                    resolve(data);
                }
                ).catch((err) => {
                    reject(err);
                })
        }).catch((err)=>{
            reject(err)
         })
            
    })

}


module.exports = {
    getAll_sgroups,
    get_gSensor_by_id,
    create_sgroup,
    sensorMap_to_sgroup,
    update_sgroup,
    delete_sgroup
}