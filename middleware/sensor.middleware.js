const { Op } = require("sequelize");
let { sensorModel } = require('../models/sensor.iot.model')
let { s_groupModel } = require('../models/s_group.iot.model')
var responseList = require('../config/response.code.json')
let { create_log } = require('./logger.middleware')
let { log}=require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');

function resolve_sensor_id(req, res, next) {
        // get the pk by rec_id
    let sensor_rec_id = req.body['sensor_rec_id']
    let request_key = uuid();


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
        create_log('update sensor mapping', log.log_level.error, error.message,log.req_type.inbound,request_key,req)
    })

}

function update_sensor(group_id, active,req) {
    let request_key = uuid();
    s_groupModel.findOne(
        {
            where: {
                id: group_id
            },
            include: [{
                model: sensorModel,
                as: 'sensor'
            }]
        }
    ).then((data) => {
        if (data) {
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
                    //null for req
                    create_log('executing the update query', log.log_level.trace,responseList.trace.excuting_query.message,log.req_type.inbound,request_key,req)
                    if (!data || data.length === 0 || data[0] === 0) {
                        create_log("update sensor", log.log_level.error,responseList.error.error_no_data,log.req_type.inbound,request_key,req)
                         res.send(
                             { code: responseList.error.error_no_data.code,status: responseList.error.error_no_data.message}
                         );
                    };
                    // send the response.
                    create_log("update sensor", log.log_level.info,responseList.success.sucess_data.message,log.req_type.inbound,request_key,req)
                    res.send({ data: data, code: responseList.success.code,status:responseList.success.sucess_data.message });

                    //end
                }).catch((error) => {
                    create_log("update sensor", log.log_level.error,error.message,log.req_type.inbound,request_key,req)
                    res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
                });
            }
        }
    })
}


module.exports = {
    resolve_sensor_id, update_sensor
}