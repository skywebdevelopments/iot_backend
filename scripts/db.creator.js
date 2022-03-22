// iot models.
const { communicationModel } = require('../models/communication.iot.model')
const { locationModel } = require('../models/location.iot.model')
const { mqtt_userModel } = require('../models/mqttUser.iot.model')
const { node_communicationModel } = require('../models/nodeCommunication.iot.model')
const { node_groupModel } = require('../models/nodeGroup.iot.model')
const { nodeModel } = require('../models/node.iot.model')
const { n_groupModel } = require('../models/n_group.iot.model')
const { userModel } = require('../models/user.iot.model')
const { u_groupModel } = require('../models/u_group.iot.model')
const { sessionModel } = require('../models/session.iot.model')
const { logModel } = require('../models/logger.iot.model');
const { GroupRoleModel } = require('../models/groupRole.iot.model');
const { entityModel } = require('../models/entity.iot.model')

// end of Model

const bcrypt = require('bcrypt');

// 
function createSchema() {
    return new Promise((resolve, reject) => {
        try {       
          //entityModel.sync({ force: true })

          sequelize.sync({ force: true });

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