let db = require('../database/knex_connection')


function updateMqttUser(req) {
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user')
            .where('mqtt_user.rec_id', '=', req.body['rec_id'])
            .update(req.body)
            .then(data => {
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}
function deleteMqttUser(req) {
    return new Promise((resolve, reject) => {
        db.knex('mqtt_user')
            .where('mqtt_user.rec_id', '=', req.body['rec_id'])
            .del()
            .then(data => {
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}


module.exports = {
    updateMqttUser,
    deleteMqttUser
}