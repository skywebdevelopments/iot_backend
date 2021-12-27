const { Op } = require("sequelize");
let { sensorModel } = require('../models/sensor.iot.model')
var responseList = require('../config/response.code.json')
let { log } = require('../logger/app.logger')
function resolve_sensor_id(req, res, next) {
    let sensor_rec_id = req.body['sensor_rec_id']

    // get the pk by rec_id

    sensorModel.findOne(
        {
            where:
            {
                rec_id: {
                    [Op.eq]: sensor_rec_id
                }
            }
        }
    ).then(data => {
        req.body.sensor_pk = data['id']
        next();
    }).catch(error => {
        log.trace(` ERROR - inbound request - update sensor mapping - ${error}`);

    })

}




module.exports = {
    resolve_sensor_id
}