var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')

let { json } = require("sequelize");
let { uuid, isUuid } = require('uuidv4');
var authenticate = require('../auth/authentication_JWT');
var router = express.Router();

var control = require('../controls/node.control')
var { createnodeSchema, RequiredRec_Id, updatenodeSchema } = require('../validators/nodecreate.validator.iot')
var { validateRequestSchema } = require('../middleware/validate-request-schema')


// GET / api / v1 / node
// Return all nodes profiles 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["node:list"]), function (req, res, next) {
    let request_key = uuid();
    control.Getnodes(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
        }
        else {

            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)

// Post / api / v1 / node /
//     Return a node profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/', authenticate.authenticateUser, authenticate.UserRoles(["node:list"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.GetnodebyId(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        else {
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
            return;
        }
    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}
)

// Create a node
// Post / api / v1 / node / create
// Create a nodes profile

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["node:create"]), createnodeSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    console.log('***********************************************Route***********')
    console.log(req.body)
    console.log('***********************************************Route***********')
    control.Createnode(req, request_key).then((data) => {
        
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        else {
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.code });
            return;
        }

    }).catch((error) => {

        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)



// Update a node profile
// Post / api / v1 / node / update
// update a node's profile by rec_id

router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["node:update"]), updatenodeSchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();


    control.Updatenode(req, request_key).then((data) => {

        if (!data || data.length === 0 || data[0] === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            res.send({ data: data, status: responseList.success.success_updating_data.message, code: responseList.success.success_updating_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)


// Delete a node
// Delete / api / v1 /  node / delete
// Delete a nodes profile by rec_id


router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["node:delete"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.Deletenode(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }

        else {
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)

router.get('/count', authenticate.authenticateUser, authenticate.UserRoles(["node:list"]), validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.Getcount(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            return;
        }
        else {
            res.send({ data: data, status: responseList.success.sucess_data.message, code: responseList.success.code });
            return;
        }
    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })
}
)


module.exports = router;