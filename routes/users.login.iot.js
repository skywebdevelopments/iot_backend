var express = require('express');
var router = express.Router();
var authenticate = require('../auth/authentication_JWT');
let { userModel } = require('../models/user.iot.model');
let { sessionModel } = require('../models/session.iot.model');

/*
POST /users/GenerateToken
Return a Token for a specific user.
Parameters:username and password of a user
*/
router.post('/GenerateToken', (req, res) => {
   console.log(req.body)
    const { email, password } = req.body;
   
    userModel.findOne({
        where: {
            email: email,
            password: password
        }
    }).then((user) => {
        if (!user) {
            res.status(401).json({ success: false, msg: "could not find user" });
            return;
        }
        var token = authenticate.getToken(user); //create token using id and you can add other inf
        sessionModel.findOne({
            where: {
                userId: user.id,
                active:true
            }
        }).then((session) => {
            if (!session) {
                sessionModel.create({
                    token:token,
                    active:true,
                    userId:user.id
                  })
                  return;
            }
            sessionModel.update({ active: false }, {
                where: {
                    id: session.id
                }
            })
            sessionModel.create({
                token:token,
                active:true,
                userId:user.id
              })
        })
        res.status(200).json({ success: true, token: token, status: 'You are successfully logged in!' });
    }).catch((err) => {
        console.log("Error ", err);
        res.send(err);
    });
});

/*
GET /users/GenerateToken
Parameters:None
Success Response is the jwt send by header is correct
*/
router.get('/VerifyToken',authenticate.verifyUser,authenticate.authenticateUser, (req, res) => {
    res.redirect("http://localhost:4200/addSensor")
});
module.exports = router;
