var express = require('express');
var responseList = require('../config/response.code.json')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
var control = require('../controls/n_groups.control')
let { validateRequestSchema } = require('../middleware/validate-request-schema');
var validators = require('../validators/n_groups.validator.iot');


// GET / api / v1 / n_group
// Return all nodes’ groups 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["n_group:list"]), function (req, res, next) {
    let request_key = uuid();
    control.getAll_ngroups(request_key, req).then(data => {
        res.send({ data: data, code: responseList.success.code, message: responseList.success.sucess_data.message });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    })
});


// Post / api / v1 / n_group /
//     Return a group and all correlated sensors by a groupId
// Parameters:
// {
// “groupId”: 1
// }
router.post('/', validators.get_n_groupByID, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:list"]), function (req, res, next) {
    let request_key = uuid();
    control.get_gnode_by_id(req, request_key).then((data) => {
        res.send({ data: data, code: responseList.success.sucess_data.code, message: responseList.success.sucess_data.message });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    });
});

// Create a node Group
// Post / api / v1 / n_group / create
// Create a node’ group 
//// Parameters:
//{
//   "name": "group 2",
//   "active": true
//}
router.post('/create', validators.n_group_create, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:create"]), function (req, res, next) {
    let request_key = uuid();
    //call create group function
    control.create_ngroup(req, request_key).then(data => {
        res.send({
            data: data,
            code: responseList.success.success_creating_data.code,
            message: responseList.success.success_creating_data.message
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message });
    });
});



// Map nodes to n_group
// Post / api / v1 / n_group / nodemap
//// Parameters:
// {
// “rec_id”: “f1af8379-3891-446c-9815-1473037c538e”
// “nodeId”: 1
// }
router.post('/nodemap', validators.ngroup_nodeMap, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:create"]), function (req, res, next) {
    let request_key = uuid();
    control.nodeMap_to_ngroup(req, request_key).then(() => {
        res.send({
            code: responseList.success.code,
            message: responseList.success.message
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    })

});


// Update a Group
// Put / api / v1 / n_group / update
// update a node’ group by rec_id
/*
{
   "rec_id": "4128b8f5-ab99-4fd3-8665-6b5d8c617dd1",
   "active": false,
   "name": "group 2 - edited"
}
*/
router.put('/update', validators.n_group_update, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:update"]), function (req, res, next) {
    let request_key = uuid();
    control.update_ngroup(req, request_key).then(data => {
        res.send({
            message: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    });
});


// Delete a Group
// post / api / v1 / n_group / delete
// Delete a node’ group by rec_id
/*{
    "rec_id": "3c277450-4f02-4141-af3f-8e4e6436b2d0"
 }
*/
router.post('/delete', validators.n_group_delete, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:delete"]), function (req, res, next) {
    let request_key = uuid();
    control.delete_ngroup(req, request_key).then(() => {
        res.send({
            message: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    })
});


// Delete a Group
// post / api / v1 / n_group / delete/ relation
// Delete a node’ group relation by nodeId
/*{
    "nodeId": "1"
 }
*/
router.post('/delete/relation', validators.n_group_delete_relation, validateRequestSchema, authenticate.authenticateUser, authenticate.UserRoles(["n_group:delete"]), function (req, res, next) {
    let request_key = uuid();
    control.delete_ngroup_relation(req, request_key).then(() => {
        res.send({
            message: responseList.success.message,
            code: responseList.success.code
        });
    }).catch((error) => {
        res.send({ code: error.code, message: error.message })
    })
});


// 
/** ------ */

module.exports = router;
