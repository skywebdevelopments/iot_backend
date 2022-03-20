var express = require('express');
// conf
var responseList = require('../config/response.code.json')
var authenticate = require('../auth/authentication_JWT');
let { log } = require('../config/app.conf.json')
var cryptojs = require('crypto-js');
// end
let { Op } = require("sequelize");
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();

// models
let { mqtt_userModel } = require('../models/mqttUser.iot.model')
// end


var control = require('../controls/mqttUser.control')
let { validateRequestSchema } = require('../middleware/validate-request-schema');
var validators = require('../validators/mqttusers.validator.iot');



// GET / api / v1 /mqttuser
// Return all mqtt_user profiles 

router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:list"]), function (req, res) {
    // code block
    let request_key = uuid();
    control.getAll_mqttUsers(req, request_key).then(data => {
        if (!data || data.length === 0) {
            res.send(
                { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            );
            return;
        }
        res.send({ data: data, code: responseList.success.code, status: responseList.success.sucess_data.message });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    })

});



/*
// create mqtt_user profile 
POST / api / v1 / mqttuser /create
Parameters
{
    "is_superuser":true,
    "username":"emqx1",
    "password":"passowrd2",
    "salt":null

}
*/
router.post('/create', validators.mqttuser_create, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:create"]), (req, res) => {
    let request_key = uuid();
    let password = req.body['password'];
    var hash = cryptojs.SHA256(password);
    req.body['password'] = cryptojs.enc.Base64.stringify(hash);
    control.create_mqttUsers(req, request_key).then(data => {
        if (data.rowCount === 0) {
            res.send(
                {
                    code: responseList.error.error_already_exists.code,
                    status: responseList.error.error_already_exists.message
                }
            );
            return;
        };
        res.send({
            code: responseList.success.success_creating_data.code,
            status: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
    });

});


//ps not sure about what this api should update?
//is not available in document

// Update mqtt_user
// Post / api / v1 / mqttuser / update
// update mqttuser  by rec_id
//Parameters
/*{
    "rec_id":"ee3c91c9-eee8-44ca-ace3-66bb71a42bd4",
    "is_superuser":false,
    "username":"emqx1",
    "password":"passowrd2",
    "salt":null

}*/

router.put('/update', validators.mqttuser_update, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:update"]), function (req, res) {
    let request_key = uuid();
    let password = req.body['password'];
    var hash = cryptojs.SHA256(password);
    req.body['password'] = cryptojs.enc.Base64.stringify(hash);
    control.update_mqttUsers(req, request_key).then(data => {
        if (!data || data.rowCount === 0) {
            res.send({ code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message })
            return;
        }
        res.send({
            status: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });
});


// Delete a mqtt_user
// Delete / api / v1 / mqttuser / delete
// Delete a mqttuser by rec_id
//Parameters
/*{
    "rec_id":"ee3c91c9-eee8-44ca-ace3-66bb71a42bd4"
}*/
router.post('/delete', validators.mqttuser_delete, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["mqttuser:delete"]), function (req, res) {
    let request_key = uuid();
    control.delete_mqttUsers(req, request_key).then(data => {
        if (!data || data.rowCount === 0 ||data.length===0) {
            res.send({ code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message })
            return;
        }
        res.send({
            status: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        console.log(error)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });

});



module.exports = router;
