var express = require('express');
var responseList = require('../config/response.code.json')
let { log } = require('../config/app.conf.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
const cryptojs = require('crypto-js');
const { body, validationResult } = require('express-validator');
var authenticate = require('../auth/authentication_JWT');
let { create_log } = require('../middleware/logger.middleware');
var control = require('../controls/s_groups.control')



// GET / api / v1 / s_group
// Return all sensors’ groups 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
    try {
        control.getAll_sgroups(req, res, request_key)
    } catch (error) {
        create_log('list sensor group', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});


// Post / api / v1 / s_group /
//     Return a group and all correlated sensors by a groupId
// Parameters:
// {
// “groupId”: 1
// }
router.post('/', body('groupId').isNumeric(), authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code block
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !req.body['groupId']) {
            create_log('list sensor group with ID', log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_missing_payload.code, status: responseList.error.error_missing_payload.message })
            return;
        }
        //2.validation :check if the req is valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            create_log('list sensor group with ID', log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_invalid_payload.code, status: responseList.error.error_invalid_payload.message })
            return;
        }
        control.get_gSensor_by_id(req, res, request_key)
    } catch (error) {
        create_log('list sensor group with ID', log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});

// Create a Sensor Group
// Post / api / v1 / s_group / create
// Create a sensors’ group 
//// Parameters:
//{
//   "name": "group 2",
//   "active": true
//}

router.post('/create', body('name').isString(), body('active').isBoolean(), authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code block
        let group_name = req.body['name']
        let active_flag = req.body['active']
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !group_name || group_name.length === 0 || group_name === undefined || active_flag == undefined) {
            create_log("create sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                code: responseList.error.error_missing_payload.code,
                status: responseList.error.error_missing_payload.message
            });
            return;
        };
        // 2.validation :check if the req is valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            create_log('create sensor group', log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_invalid_payload.code, status: responseList.error.error_invalid_payload.message })
            return;
        }

        //call create group function
        control.create_sgroup(req, res, request_key);
    } catch (error) {
        create_log("create sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});



// Map Sensors to s_group
// Post / api / v1 / s_group / sensormap
//// Parameters:
// {
// “group_rec_id”: “f1af8379-3891-446c-9815-1473037c538e”
// “sensorId”: 1
// }
router.post('/sensormap', body('sensorId').isNumeric(), authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    let sensorId = req.body['sensorId']
    let rec_id = req.body['group_rec_id']
    try {
        // 1.validation : check if the req has a body
        if (!req.body || req.body === undefined || !sensorId || !rec_id || rec_id.length === 0 || sensorId.length === 0) {
            create_log("map sensor to group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({ status: responseList.error.error_missing_payload.message, code: responseList.error.error_missing_payload.code })
            return;
        }
        // 2.validation :check if the req is valid
        const errors = validationResult(req);
        if (!errors.isEmpty() || !isUuid(rec_id)) {
            create_log('create sensor group', log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({ code: responseList.error.error_invalid_payload.code, status: responseList.error.error_invalid_payload.message })
            return;
        }
        create_log(`query for group with ${rec_id}`, log.log_level.trace, responseList.trace.executing_query.message, log.req_type.inbound, request_key, req)
        control.sensorMap_to_sgroup(req, res, request_key);
    } catch (error) {
        create_log("map sensor to group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});


// Update a Group
// Put / api / v1 / s_group / update
// update a sensors’ group by rec_id
/*
{
   "rec_id": "4128b8f5-ab99-4fd3-8665-6b5d8c617dd1",
   "active": false,
   "name": "group 2 - edited"
}
*/
router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["s_group:update"]), function (req, res, next) {
    let request_key = uuid();
    try {
        // code bloc

        let rec_id = req.body['rec_id']
        let group_name = req.body['name']
        let active = req.body['active']

        // 1.validation:check if the req is valid
        if ((group_name !== undefined && (typeof group_name !== 'string')) || (active !== undefined && (typeof active !== 'boolean'))) {
            create_log("update sensor group", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }
        // 2.validation: rec_id isn't an empty value
        if (!req.body || req.body === undefined || !rec_id || rec_id.length === 0 || ((!group_name || group_name.length === 0 || group_name === undefined) && active === undefined)) {
            create_log("update sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        }
        control.update_sgroup(req, res, request_key)
    } catch (error) {
        create_log("update sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});


// Delete a Group
// post / api / v1 / s_group / delete
// Delete a sensors’ group by rec_id
/*{
    "rec_id": "3c277450-4f02-4141-af3f-8e4e6436b2d0"
 }
*/
router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["s_group:delete"]), function (req, res, next) {
    let request_key = uuid();
    try {
        let rec_id = req.body['rec_id']
        // 1.validation: rec_id isn't an empty value
           if (!req.body || req.body === undefined || !rec_id ||rec_id.length === 0) {
            create_log("delete sensor group", log.log_level.error, responseList.error.error_missing_payload.message, log.req_type.inbound, request_key, req)

            res.send({
                status: responseList.error.error_missing_payload.message,
                code: responseList.error.error_missing_payload.code
            });
            return;
        }
        // 2.validation: rec_id is uuid v4
        if (!isUuid(rec_id)) {
            create_log("delete sensor group", log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
            res.send({
                status: responseList.error.error_invalid_payload.message,
                code: responseList.error.error_invalid_payload.code
            });
            return;
        }
     
        control.delete_sgroup(req, res, request_key)
    } catch (error) {
        create_log("delete sensor group", log.log_level.error, error.message, log.req_type.inbound, request_key, req)
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    }
});

// 
/** ------ */

module.exports = router;
