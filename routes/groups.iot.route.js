var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { response, request } = require('express');
let { Op, json, UUIDV4 } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid } = require('uuidv4');
var router = express.Router();
// models
let { sensorModel } = require('../models/sensor.iot.model')
let { sensor_groupModel } = require('../models/sensor_group.iot.model');
const { groupModel } = require('../models/group.iot.model');
// end



// GET / api / v1 / groups
// Return all sensors’ groups 

router.get('/', function (req, res, next) {
    // code bloc
    // 1. db_operation: select all query
    groupModel.findAll({

        include:{
            model:sensorModel,
            as: "sensor"
        } 
    }).then((data) => {

        // log.trace(`${UUIDV4} - inbound request - ${req.url} - ${data}`);
        // 2. return data in a response.
        if (!data) {
            res.send("no data found")
        }
        // send the response.
        res.send(data);

        //end
    }).catch((error) => {
        console.error(error);
        res.send(error.message)

    });
});

/** ------ */

module.exports = router;
