var express = require('express');
var responseList = require('../config/response.code.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
var dashboardControl = require('../controls/dashboard.control')
// let { validateRequestSchema } = require('../middleware/validate-request-schema');
// var validators = require('../validators/n_groups.validator.iot');


// GET / api / v1 / dashboard
// Return all user dashboard from userid in token  
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["dashboard"]), function (req, res, next) {
    let request_key = uuid();
    dashboardControl.get_dashboard(request_key, req)
        .then(data => {
            res.send({ data: data, code: responseList.success.code, message: responseList.success.sucess_data.message });
        }).catch((error) => {
            res.send({ code: error.code, message: error.message })
        })
});

// POST / api / v1 / dashboard / message
//return message for given entity id 
//parameters:{
// entityId :1
// }
router.post('/message', authenticate.authenticateUser, authenticate.UserRoles(["dashboard"]), function (req, res, next) {
    let request_key = uuid();
    dashboardControl.get_entity_message(request_key, req)
        .then(data => {
            res.send({ data: data, code: responseList.success.code, message: responseList.success.sucess_data.message });
        }).catch((error) => {
            res.send({ code: error.code, message: error.message })
        })
});


module.exports = router;