const { tokenModel } = require('../models/token.model')
const { userModel } = require('../models/user.model')
// iot models.
const { groupModel } = require('../models/group.iot.model')
const { mqtt_userModel } = require('../models/mqtt_user.iot.model')
const { sensor_groupModel } = require('../models/sensor_group.iot.model')
const { sensorModel } = require('../models/sensor.iot.model')
// end of Model

const bcrypt = require('bcrypt');


// 
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            console.log("=> please make sure to create the database before executing this script...");
            // to create the db/

            // mqtt_userModel.sync({ force: true });
            // sensorModel.sync({ force: true });
            // groupModel.sync({ force: true });
            sensor_groupModel.sync({ force: true });


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