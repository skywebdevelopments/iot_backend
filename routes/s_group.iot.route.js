var express = require('express');
var responseList = require('../config/response.code.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
var control = require('../controls/s_groups.control')
let { validateRequestSchema } = require('../middleware/validate-request-schema');
var validators = require('../validators/s_groups.validator.iot');


// GET / api / v1 / s_group
// Return all sensors’ groups 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
    control.getAll_sgroups(request_key, req).then(data => {
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


// Post / api / v1 / s_group /
//     Return a group and all correlated sensors by a groupId
// Parameters:
// {
// “groupId”: 1
// }
router.post('/', validators.get_s_groupByID, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["s_group:list"]), function (req, res, next) {
    let request_key = uuid();
    control.get_gSensor_by_id(req, request_key).then((data) => {
        if (!data || data.length === 0) {
            res.send(
                { code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            );
            return;
        }
        res.send({ data: data, code: responseList.success.sucess_data.code, status: responseList.success.sucess_data.message });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    });
});

// Create a Sensor Group
// Post / api / v1 / s_group / create
// Create a sensors’ group 
//// Parameters:
//{
//   "name": "group 2",
//   "active": true
//}

router.post('/create', validators.s_group_create, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    //call create group function
    control.create_sgroup(req, request_key).then(data => {
        if (data.rowCount === 0) {
            res.send(
                {
                    code: responseList.error.error_already_exists.code,
                    status: responseList.error.error_already_exists.message
                }
            );
            return;
        }
        res.send({
            code: responseList.success.success_creating_data.code,
            status: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message });
    });
});



// Map Sensors to s_group
// Post / api / v1 / s_group / sensormap
//// Parameters:
// {
// “group_rec_id”: “f1af8379-3891-446c-9815-1473037c538e”
// “sensorId”: 1
// }
router.post('/sensormap', validators.sgroup_sensorMap, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["s_group:create"]), function (req, res, next) {
    let request_key = uuid();
    control.sensorMap_to_sgroup(req, request_key).then(data => {
        if (!data || data.rowCount === 0) {
            res.send({ code: responseList.error.error_no_data.code, status: responseList.error.error_no_data.message }
            )
            return;
        }
        res.send({
            code: responseList.success.code,
            status: responseList.success.message
        });
    }).catch((error) => {
        res.send({ code: responseList.error.error_general.code, status: responseList.error.error_general.message })
    })

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
router.put('/update', validators.s_group_update, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["s_group:update"]), function (req, res, next) {
    let request_key = uuid();
    control.update_sgroup(req, request_key).then(data => {
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


// Delete a Group
// post / api / v1 / s_group / delete
// Delete a sensors’ group by rec_id
/*{
    "rec_id": "3c277450-4f02-4141-af3f-8e4e6436b2d0"
 }
*/
router.post('/delete', validators.s_group_delete, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["s_group:delete"]), function (req, res, next) {
    let request_key = uuid();
    control.delete_sgroup(req, request_key).then(data => {
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
    })
});

// 
/** ------ */

module.exports = router;
