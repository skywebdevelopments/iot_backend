let db = require('../database/knex_connection')
//models
const { n_groupModel } = require('../models/n_group.iot.model');
let { nodeModel } = require('../models/node.iot.model')
let { entityModel } = require('../models/entity.iot.model')
let { node_groupModel } = require('../models/nodeGroup.iot.model')
//end
var Sequelize = require('sequelize');
const { Op } = require("sequelize");
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')


//get all s_groups include asscioated nodes 
function getAll_ngroups() {
    return new Promise((resolve, reject) => {
        n_groupModel.findAll({
            include: {
                model: nodeModel,
                as: "node",
                include: {
                    model: entityModel,
                    as: "entity",
                }
            },
            order: [
                ['id', 'ASC'],
                [{model:nodeModel}, 'id', 'ASC'],
                [{model: nodeModel},{model:entityModel}, 'id', 'ASC']

            ]
        }).then((data) => {
            resolve(data)
        }).catch((err) => {
            reject(err);

        })
    })
}


//get asscoiated nodes by n_group id
function get_gnode_by_id(req) {
    return new Promise((resolve, reject) => {
        n_groupModel.findOne({
            include: {
                model: nodeModel,
                as: "node"
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
function create_ngroup(req) {
    return new Promise((resolve, reject) => {
        n_groupModel.findOne(
            {
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('name')),
                    Sequelize.fn('lower', req.body['name'])
                )
            }
        ).then((group) => {
            if (!group) {
                n_groupModel.create(req.body).then((data) => {
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

//Map node to n_group by nodeId and group_rec_id
function nodeMap_to_ngroup(req) {
    return new Promise((resolve, reject) => {
        n_groupModel.findOne({
            include: {
                model: nodeModel,
                as: "node"
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
            return data.addNode(req.body['nodeId'])
        }).then(() => {
            resolve();
        }).catch((error) => {
            reject(error)
        });
    })
}


//update n_group 
function update_ngroup(req) {
    return new Promise((resolve, reject) => {
        update_node_active(req, req.body['active']).then(() => {
            n_groupModel.findOne(
                {
                    where: Sequelize.where(
                        Sequelize.fn('lower', Sequelize.col('name')),
                        Sequelize.fn('lower', req.body['name'])
                    )
                }
            ).then((group) => {
                if (!group || req.body['rec_id'] === group['rec_id']) {
                    n_groupModel.update(req.body,
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
        }).catch((error) => {
            reject(error)
        })
    })
}


//make node unactive in case delete n_group or n_group active become false
function update_node_active(req, active) {
    return new Promise((resolve, reject) => {
        n_groupModel.findOne(
            {
                where: {
                    rec_id: req.body['rec_id']
                },
                include: [{
                    model: nodeModel,
                    as: 'node'
                }]
            }
        ).then((data) => {
            if (data) {
                if (data['node'].length !== 0) {
                    for (let node of data['node']) {
                        nodeModel.update({ active: active },
                            {
                                where: {
                                    id: {
                                        [Op.eq]: node['id']
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
                else
                    resolve(data)
            }
            else
                resolve(data)
        }).catch((error) => {
            reject(error);
        });
    })
}

//delete n_group 
function delete_ngroup(req) {
    return new Promise((resolve, reject) => {
        update_node_active(req, false).then(() => {

            n_groupModel.destroy(
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
        }).catch((err) => {
            reject(err)
        })

    })

}

//delete relation of  n_group with node
function delete_relation_ngroup(req) {
    return new Promise((resolve, reject) => {
        node_groupModel.destroy(
            {
                where: {
                    nodeId: {
                        [Op.eq]: req.body['nodeId']
                    },
                    nGroupId: {
                        [Op.eq]: req.body['nGroupId']
                    },
                },
            }

        ).then((data) => {
            resolve(data);
        }
        ).catch((err) => {
            reject(err);
        })
    })

}


module.exports = {
    getAll_ngroups,
    get_gnode_by_id,
    create_ngroup,
    nodeMap_to_ngroup,
    update_ngroup,
    delete_ngroup,
    delete_relation_ngroup
}