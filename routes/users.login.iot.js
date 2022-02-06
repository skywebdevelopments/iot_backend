var express = require('express');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
let { userModel } = require('../models/user.iot.model');
let { sessionModel } = require('../models/session.iot.model');
var responseList = require('../config/response.code.json');

/*
POST /users/GenerateToken
Return a Token for a specific user.
Parameters:username and password of a user
*/
router.post('/GenerateToken', (req, res) => {
    const { email, password } = req.body;

    userModel.findOne({
        where: {
            email: email,
            password: password
        }
    }).then((user) => {
        if (!user) {
            res.send({ status: responseList.error.error_no_user_found.message, code: responseList.error.error_no_user_found.code })
            return;
        }
        var token = authenticate.getToken(user); //create token using id and you can add other inf
        sessionModel.findOne({
            where: {
                userId: user.id,
                active: true
            }
        }).then((session) => {
            if (!session) {
                sessionModel.create({
                    token: token,
                    active: true,
                    userId: user.id
                })
                return;
            }
            sessionModel.update({ active: false }, {
                where: {
                    id: session.id
                }
            })
            sessionModel.create({
                token: token,
                active: true,
                userId: user.id
            })
        })
        res.send({ status: responseList.success.sucess_login.message, code: responseList.success.code, token: token })
    }).catch((err) => {
        res.send({ status: err, code: responseList.error.error_not_found.code })
    });
});

module.exports = router;
