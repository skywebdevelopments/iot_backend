const { tokenModel } = require('../models/token.model')
// iot models.
const { communicationModel } = require('../models/communication.iot.model')
const { locationModel } = require('../models/location.iot.model')
const { mqtt_userModel } = require('../models/mqttUser.iot.model')
const { sensor_communicationModel } = require('../models/sensorCommunication.iot.model')
const { sensor_groupModel } = require('../models/sensorGroup.iot.model')
const { sensorModel } = require('../models/sensor.iot.model')
const { groupModel } = require('../models/group.iot.model')
const { userModel } = require('../models/user.iot.model')
const { usergroupModel } = require('../models/usergroup.iot.model')
const { sessionModel } = require('../models/session.iot.model')
const { logModel } = require('../models/logger.iot.model');


// end of Model

const bcrypt = require('bcrypt');


// 
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            // console.log("=> please make sure to create the database before executing this script...");
            // to create the db/

            // logModel.sync({ force: true })
            // mqtt_userModel.sync({ force: true });
            //userModel.sync();
            // sessionModel.sync();

            // sensorModel.create({
            //     ap_name:"sensor 2",

            // })

<<<<<<< HEAD
            sequelize.sync({force:true});
           /* groupModel.findAll({ include: { model: sensorModel, as: "sensor" } }).then(data => {
                console.log(data);
            });*/
=======
            // sequelize.sync({force:true});
            /* groupModel.findAll({ include: { model: sensorModel, as: "sensor" } }).then(data => {
                 console.log(data);
             });*/
>>>>>>> 21c55cf5f386f52b5926135bc8251fafcdf2207c

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