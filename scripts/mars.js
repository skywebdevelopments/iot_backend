const { tokenModel } = require('../models/token.model')
const { userModel } = require('../models/user.model')
const { customerModel } = require('../models/customer.model')
const { employeeModel } = require('../models/employee.model')
const { inventoryModel } = require('../models/inventory.model')
const { studentModel } = require('../models/student.model')
const bcrypt = require('bcrypt');
function createSchema() {
    return new Promise((resolve, reject) => {
        try {
            console.log("=> please make sure to create the database before executing this script...");
            // userModel.sync({ force: true })
            // tokenModel.sync({ force: true })
            // customerModel.sync({ force: true })
            // employeeModel.sync({ force: true });
            // inventoryModel.sync({ force: true });
            studentModel.sync({ force: true });


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
            user_gender : "system",
            user_location: "location",
            user_address : "address",
            user_mobile:"0100"

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