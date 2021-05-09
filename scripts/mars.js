const { tokenModel } = require('../models/token')
const { userModel } = require('../models/user')
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
} catch (error) {


}