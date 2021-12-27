const { tokenModel } = require('../models/token.model')
// iot models.
const { communicationModel } = require('../models/communication.iot.model')
const { groupModel } = require('../models/group.iot.model')
const { locationModel } = require('../models/location.iot.model')
const { mqtt_userModel } = require('../models/mqttUser.iot.model')
const { sensorModel } = require('../models/sensor.iot.model')
const { sensor_communicationModel } = require('../models/sensorCommunication.iot.model')
const { sensor_groupModel } = require('../models/sensorGroup.iot.model')
const { userModel } = require('../models/user.iot.model')
const { usergroupModel } = require('../models/usergroup.iot.model')

// end of Model

const bcrypt = require('bcrypt');


// 
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            console.log("=> please make sure to create the database before executing this script...");
            // to create the db/

            // mqtt_userModel.sync({ force: true });

            sensorModel.create({
                ap_name:"sensor 2",
                  
            })
       
            // sequelize.sync({force:true});


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