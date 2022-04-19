var express = require('express');
// conf
var conf_sercet = require('../config/sercret.json')
var responseList = require('../config/response.code.json')
var fieldsList = require('../config/fields.required.json')
var authenticate = require('../auth/authentication_JWT');
var { log } = require('../config/app.conf.json')


let { Op, json } = require("sequelize");
//let { log } = require('../logger/app.logger')
let { uuid, isUuid } = require('uuidv4');
var router = express.Router();
const { body, validationResult } = require('express-validator');

var control = require('../controls/entity.control')

var { RequiredRec_Id, createentitySchema, updateentitySchema } = require('../validators/entity.validator.iot')
var { validateRequestSchema } = require('../middleware/validate-request-schema')

// Create a entity
// Post / api / v1 / entity / create
// Create a entity profile

router.post('/create', authenticate.authenticateUser, authenticate.UserRoles(["entity:create"]), createentitySchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();
    control.Create_entity(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_already_exists.message, code: responseList.error.error_no_data.code });
        }
        else {
            res.send({ data: data, status: responseList.success.success_creating_data.message, code: responseList.success.success_creating_data.code });
        }

    }).catch((error) => {
        res.send({ status: responseList.error.error_general.message, code: responseList.error.error_general.code });
    })

}
)

// GET / api / v1 / entity
// Return all entity profiles 
router.get('/', authenticate.authenticateUser, authenticate.UserRoles(["entity:list"]), function (req, res, next) {
    let request_key = uuid();
    control.GetEntity(req, request_key).then((data) => {
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

// Post / api / v1 / entity /
// Return a entity profile
// Parameters:
// {
// "rec_id": uuid
// }

router.post('/', authenticate.authenticateUser, authenticate.UserRoles(["entity:list"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    control.Getentity_byId(req, request_key).then((data) => {
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


// Update a entity profile
// Post / api / v1 / entity / update
// update a entity profile by rec_id

router.put('/update', authenticate.authenticateUser, authenticate.UserRoles(["entity:update"]), updateentitySchema, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    control.Update_entityy(req, request_key).then((data) => {

        if (data.length === 0) {
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

// Delete a entity
// Delete / api / v1 /  entity / delete
// Delete a entity profile by rec_id


router.post('/delete', authenticate.authenticateUser, authenticate.UserRoles(["entity:delete"]), RequiredRec_Id, validateRequestSchema, function (req, res, next) {
    let request_key = uuid();

    control.Delete_entity(req, request_key).then((data) => {
        if (data.length === 0) {
            res.send({ status: responseList.error.error_no_data_updated.message, code: responseList.error.error_no_data_updated.code });
        }
        else {
            res.send({ data: data, status: responseList.success.success_deleting_data.message, code: responseList.success.success_deleting_data.code });
        }
    }).catch((error) => {
        res.send({ status: error.message, code: responseList.error.error_general.code });
    })
}
)

router.get('/count', authenticate.authenticateUser, authenticate.UserRoles(["entity:list"]), validateRequestSchema, function (req, res, next) {
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