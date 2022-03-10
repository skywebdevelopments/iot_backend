// iot models.
const { communicationModel } = require('../models/communication.iot.model')
const { locationModel } = require('../models/location.iot.model')
const { mqtt_userModel } = require('../models/mqttUser.iot.model')
const { sensor_communicationModel } = require('../models/sensorCommunication.iot.model')
const { sensor_groupModel } = require('../models/sensorGroup.iot.model')
const { sensorModel } = require('../models/sensor.iot.model')
const { s_groupModel } = require('../models/s_group.iot.model')
const { userModel } = require('../models/user.iot.model')
const { u_groupModel } = require('../models/u_group.iot.model')
const { sessionModel } = require('../models/session.iot.model')
const { logModel } = require('../models/logger.iot.model');
const { SensorTypeModel } = require('../models/sensortype.iot.model')

// end of Model

const bcrypt = require('bcrypt');

// 
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            // console.log("=> please make sure to create the database before executing this script...");
            // to create the db/

           // sensorModel.sync({ force: true })
            // mqtt_userModel.sync({ force: true });
            //SensorTypeModel.sync();
            //u_groupModel.sync();

            // sensorModel.create({
            //     ap_name:"sensor 2",

            // })

            sequelize.sync();
            /* groupModel.findAll({ include: { model: sensorModel, as: "sensor" } }).then(data => {
                 console.log(data);
             });*/

            resolve("success")
        } catch (error) {
            reject(error)

        }
    })
}

function createUser() {

    bcrypt.hash("admin123@", 10, function (err, hash) {
        userModel.create({
            user_email: "admin@admin.com",
            user_password: hash,
            user_role: "admin",
            user_gender: "system",
            user_location: "location",
            user_address: "address",
            user_mobile: "0100"

        });

    });


}

try {
    createSchema();
    // setTimeout(() => {

    //     createUser();
    // }, 3000);


} catch (error) {
    console.error(error);
}