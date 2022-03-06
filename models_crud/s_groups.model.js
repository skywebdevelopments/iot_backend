let db = require('../database/knex_connection')
let { uuid } = require('uuidv4');


//get all s_groups include asscioated sensors 
function getAll_sgroups() {
    return new Promise((resolve, reject) => {
            db.knex('s_group').select('*',
            's_group.id as group_id','sensor.id as sensor_id',
            's_group.active as group_active','sensor.active as sensor_active',
            's_group.rec_id as group_rec_id','sensor.rec_id as sensor_rec_id')
            .leftJoin('sensor_group', function () {
                this.on('s_group.id', '=', 'sensor_group.sGroupId')
            })
            .leftJoin('sensor', function () {
                this.on('sensor.id', '=', 'sensor_group.sensorId')
            })
            .then(function (rows) {
                resolve(rows)
            }).catch((err) => {
                reject(err);

            })
    })
}


//get asscoiated sensors by s_group id
function get_gSensor_by_id(req) {
    return new Promise((resolve, reject) => {
        db.knex('s_group').select('*')
            .where('s_group.id', '=', req.body['groupId'])
            .innerJoin('sensor_group', function () {
                this.on('s_group.id', '=', 'sensor_group.sGroupId')
            }).innerJoin('sensor', function () {
                this.on('sensor.id', '=', 'sensor_group.sensorId')
            }).then(function (rows) {
                resolve(rows);
            }).catch((err) => {
                reject(err);
            })
    })
}

//create s_group
function create_sgroup(req) {
    req.body['rec_id'] = uuid();
    return new Promise((resolve, reject) => {
        db.knex('s_group').insert(req.body).onConflict('name')
            .ignore().then(data => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
    })
}

//Map sensor to s_group by sensorId and group_rec_id
function sensorMap_to_sgroup(req) {
    return new Promise((resolve, reject) => {
        db.knex('s_group').select('id')
            .where('s_group.rec_id', '=', req.body['group_rec_id'])
            .then(data => {
                db.knex('sensor_group').insert({ sensorId: req.body['sensorId'], sGroupId: data[0].id }).then(data => {
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                })
            }).catch((err) => {
                reject(err);
            })
    })
}


//update s_group 
function update_sgroup(req) {

    return new Promise((resolve, reject) => {
        if (!req.body['active']) {
            update_sensor_active(req)
            if (update_sensor_active(req) !== "true")
                reject(update_sensor_active(req));
        }
        db.knex('s_group')
            .where('s_group.rec_id', '=', req.body['rec_id'])
            .update(req.body).then((data) => {
                resolve(data);
            }
            ).catch((err) => {
                reject(err);
            })
    })
}


//make sensor unactive in case delete s_group or s_group active become false
function update_sensor_active(req) {
    db.knex('s_group').select('id')
        .where('s_group.rec_id', '=', req.body['rec_id'])
        .then(data => {
            db.knex('s_group').select('sensorId')
                .where('s_group.id', '=', data[0].id)
                .innerJoin('sensor_group', function () {
                    this.on('s_group.id', '=', 'sensor_group.sGroupId')
                }).then(function (rows) {
                    if (rows.length !== 0) {
                        for (let row of rows) {
                            db.knex('sensor')
                                .where('sensor.id', '=', row.sensorId)
                                .update({ active: false }).then(() => {
                                    return "true";
                                }).catch((err) => {
                                    return err;
                                })
                        }
                    }
                    return "true";
                }
                ).catch((err) => {
                    return err;
                })
        }).catch((err) => {
            return err;
        })
    return "true";
}

//delete s_group 
function delete_sgroup(req) {
    update_sensor_active(req)
    return new Promise((resolve, reject) => {
        if (update_sensor_active(req) === "true") {
            db.knex('s_group')
                .where('s_group.rec_id', '=', req.body['rec_id'])
                .del().then((data) => {
                    resolve(data);
                }
                ).catch((err) => {
                    reject(err);
                })
        }
        else {
            reject(update_sensor_active(req));
        }
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