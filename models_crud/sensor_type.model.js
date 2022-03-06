let db = require('../database/knex_connection')
let { uuid, isUuid } = require('uuidv4');


function create_sensor_type(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('sensor_type').insert(req.body).onConflict('type')
            .ignore().then(function (rows) {
                resolve(rows)
            }).catch((err) => {
                reject(err);
            })
    })
}

function getAll_senortype(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .select()
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function getSensor_type_byId(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .select()
            .where('sensor_type.rec_id', '=', req.body['rec_id'])
            .then(function (rows) {
                resolve(rows)
            }).catch(err => {
                reject(err)
            })
    })
}

function updateSensortype(req) {
    console.log(req.body)
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .where('sensor_type.rec_id', '=', req.body['rec_id'])
            .update(req.body)
            .then(data => {
                resolve(data);
            }).catch(err => {
                reject(err)
            })
    })
}

exports.deleteArticleById = function (req, res, next) {
    const { article_id } = req.params;
    return connection('comments')
        .where('comments.article_id', article_id)
        .del()
        .returning('*')
        .then((deleted) => {
            console.log(deleted);
            return connection('articles')
                .where('articles.article_id', article_id)
                .del()
                .returning('*');
        })
        .then((article) => {
            console.log(article);
            return res.status(204).send('article deleted');
        })
        .catch(err => next(err));
};

function deleteSensortype(req) {
    return new Promise((resolve, reject) => {
        db.knex('sensor_type')
            .select('id')
            .where('sensor_type.rec_id', '=', req.body['rec_id'])
            .then(function (unit) {
                db.knex('sensor')
                    .where('sensor.sensorTypeId', '=', unit[0].id)
                    .del()
                    .then(() => {
                        db.knex('sensor_type')
                            .where('sensor_type.rec_id', '=', req.body['rec_id'])
                            .del()
                            .then(() => {
                                resolve();
                            }).catch(err => {
                                reject(err)
                            })
                    }).catch(err => {
                        reject(err)
                    })
            }).catch(err => {
                reject(err)
            })


    })

}

module.exports = {
    create_sensor_type,
    getAll_senortype,
    getSensor_type_byId,
    updateSensortype,
    deleteSensortype
}

