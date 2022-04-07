var express = require('express');
var responseList = require('../config/response.code.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
var dashboardControl = require('../controls/dashboard.control')
 let { validateRequestSchema } = require('../middleware/validate-request-schema');
 var validators = require('../validators/dashboard.validator');


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

// GET / api / v1 / dashboard / messages / :id
//return message for given entity id 
//parameters:{
// entityId :1
// }
router.get('/messages/:id', authenticate.authenticateUser, authenticate.UserRoles(["dashboard"]), function (req, res, next) {
    let request_key = uuid();
    dashboardControl.get_entity_message(request_key, req)
        .then(data => {
            res.send({ data: data, code: responseList.success.code, message: responseList.success.sucess_data.message });
        }).catch((error) => {
            res.send({ code: error.code, message: error.message })
        })
});

// Create a new Dashboard
// Post / api / v1 / dashboard / create
// Create a new dashboard for user
//// Parameters:
//{
// "chart_header" : string   eg:"Chart 1"
// "chart_title" : string    eg:"test graph"
// "card_type" : string      eg:"chart"
// "entity_id" : int         eg: 2
// "chart_type" : string     eg:"area"
//}
router.post('/create', validators.createdashboardSchema, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["dashboard"]), function (req, res, next) {
    let request_key = uuid();
   
    dashboardControl.create_dashboard(req, request_key).then(data => {
        res.send({
            data: data,
            code: responseList.success.success_creating_data.code,
            message: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message });
    });
});


module.exports = router;