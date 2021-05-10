const { tokenModel } = require('../models/token')
const { userModel } = require('../models/user')
const bcrypt = require('bcrypt');
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            userModel.sync({ force: true }).catch((error) => {
                console.error(error);

                console.log("please make sure to create a database: auth before running this script....");
                console.log("==========================================================================");

            });
            tokenModel.sync({ force: true }).catch((error) => {
                console.error(error);

                console.log("please make sure to create a database: auth before running this script....");
                console.log("==========================================================================");

            });

            resolve("success")
        } catch (error) {
            reject(error)

        }
    })
}

function createUser() {

    bcrypt.hash("admin", 10, function (err, hash) {
        userModel.create({
            user_email: "admin",
            user_password: hash,
            user_role: "admin"

        });

    });


}

createSchema();
setTimeout(() => {

    createUser();
}, 3000);