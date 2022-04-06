let node = require('../models/node.iot.model')
let logs = require('../models/logger.iot.model')
let entity = require('../models/entity.iot.model')


function getDashboardStats(req, request_key) {
    let stats = []

    return new Promise((resolve, reject) => {

        node.nodeModel.count().then((data) => {

            stats.push({ "key": 'node', "count": data })

            logs.logModel.count().then((data) => {
                stats.push({ "key": 'logs', "count": data })


                entity.entityModel.count().then((data) => {
                    stats.push({ "key": 'entity', "count": data })
                    resolve(stats)
                }).catch((err) => {
                    reject(err);
                })

            }).catch((err) => {
                reject(err);
            })

        }).catch((err) => {
            reject(err);
        })








    })
}



module.exports = {
    getDashboardStats
}