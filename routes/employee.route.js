var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { securedWithToken, decryptReqBody, encrypt, decrypt } = require('../securitylayer/auth')
let { tokenModel } = require('../models/token.model');
let { employeeModel } = require('../models/employee.model');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { response, request } = require('express');
let { Op, json } = require("sequelize");
var router = express.Router();



// accepts token
router.get('/all', securedWithToken, (req, res, next) => {
    employeeModel.findAll({}).then((data) => {
        if (data) return res.send(response = data, status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});
// accepts token , employee:id
router.post('/one', securedWithToken, (req, res, next) => {
    let employee_id = req.body['id'];
    employeeModel.findOne({ where: { id: employee_id } }).then((data) => {
        if (data) return res.send(response = data, status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});
// accepts user_email , user_password , user_role
router.post('/create', securedWithToken, (req, res, next) => {
    employeeModel.create(req.body).then((data) => {
        if (data) return res.send(response = "user was created", status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});

// accepts the user_email : updates the whole record with user-email.
router.post('/update', securedWithToken, (req, res, next) => {

    employeeModel.update(req.body, { where: { user_email: req.body.user_email } }).then((data) => {


        if (data) return res.send(response = `user ${req.body.user_email} was updated.`, status = 200);
        res.send(`record not found, please try again.`, status = 400);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    });
});
// accepts the record id
router.post('/updateById', securedWithToken, (req, res, next) => {

    employeeModel.update(req.body, { where: { id: req.body.id } }).then((data) => {


        if (data) return res.send(response = `user ${req.body.user_email} was updated.`, status = 200);
        res.send(`record not found, please try again.`, status = 400);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    });
});
// accepts the id
router.post('/delete', securedWithToken, (req, res, next) => {
    let employee_id = req.body['id']
    employeeModel.destroy({ where: { id: employee_id } }).then((data) => {

        if (data) return res.send(response = `user ${req.body.user_email} was deleted.`, status = 200);
        res.send(`record not found, please try again.`, status = 200);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    })


});



/** ------ */


module.exports = router;
