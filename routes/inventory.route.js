var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { securedWithToken, decryptReqBody, encrypt, decrypt } = require('../securitylayer/auth')
let { tokenModel } = require('../models/token.model');
let { inventoryModel } = require('../models/inventory.model');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { response, request } = require('express');
let { Op, json } = require("sequelize");
let { log } = require('../logger/app.logger')
let { uuid } = require('uuidv4');

var router = express.Router();



// accepts token
router.get('/all', securedWithToken, (req, res, next) => {
    inventoryModel.findAll({}).then((data) => {
        if (data) return res.send(response = data, status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});
// accepts token , inventory:id
router.post('/one', securedWithToken, (req, res, next) => {
    let inventory_id = req.body['id'];
    inventoryModel.findOne({ where: { id: inventory_id } }).then((data) => {
        if (data) return res.send(response = data, status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});
// accepts user_email , user_password , user_role
router.post('/create', securedWithToken, (req, res, next) => {
    inventoryModel.create(req.body).then((data) => {
        if (data) {
            log.trace(`a product was created`)
            return res.send(response = "product record was created", status = 200, statusText = "success", statusClass = "success");
        }
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});

// accepts the inventory:id 
router.post('/update', securedWithToken, (req, res, next) => {

    inventoryModel.update(req.body, { where: { id: req.body['id'] } }).then((data) => {


        if (data) return res.send(response = `product record ${req.body.user_email} was updated.`, status = 200);
        res.send(`product record not found, please try again.`, status = 400);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    });
});
// accepts the product record id
router.post('/updateById', securedWithToken, (req, res, next) => {

    inventoryModel.update(req.body, { where: { id: req.body.id } }).then((data) => {


        if (data) return res.send(response = `product record ${req.body.user_email} was updated.`, status = 200);
        res.send(`product record not found, please try again.`, status = 400);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    });
});
// accepts the id
router.post('/delete', securedWithToken, (req, res, next) => {
    let inventory_id = req.body['id']
    inventoryModel.destroy({ where: { id: inventory_id } }).then((data) => {

        if (data) return res.send(response = `product record ${req.body.user_email} was deleted.`, status = 200);
        res.send(`product record not found, please try again.`, status = 200);
    }).catch((err) => {

        return res.send(response = err, status = 500);
    })


});



/** ------ */


module.exports = router;
