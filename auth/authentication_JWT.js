const passport = require("passport");
const passportJwt = require('passport-jwt'); // we use it for startegy used to extract the actual jwt password
const ExtractJwt = passportJwt.ExtractJwt;
const StartegyJwt = passportJwt.Strategy;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let { sessionModel } = require('../models/session.iot.model');
var config = require('../config/config.json');
//const { any } = require("sequelize/types/lib/operators");


// sign a token (create a token for a user)
exports.getToken = function (user) {
    const id = user.id;
    const name = user.username;
    const roles = user.roles;
    const expiresIn = "1d";
    const payload = {
        id: id,
        name: name,
        roles: roles,
        iat: Date.now(),
    };

    const signedToken = jwt.sign(payload, config.secretKey, {
        expiresIn: expiresIn
    });
    return signedToken

};

//options used in passport token startegy 
var opts = {}; //options for jwt passport
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // extract from header l token
opts.secretOrKey = config.secretKey; // l secret key bt3 l token mn l config file
passport.use(
    new StartegyJwt(opts,
        //done is a function 
        (jwtPayload, done) => {
            // works as decrypted
            return sessionModel.findOne(
                {
                    where: {
                        userId: jwtPayload.id,
                        active: true
                    }
                }
            ).then((session) => {
                return done(null, session); //it works
            }).catch((err) => {
                return done(err);
            });
        })
);

// exports.verifyUser = passport.authenticate('jwt', { session: false }); // veify using jwt staregy and set session to false as we will not use it 

exports.authenticateUser = function (req, res, next) {
    passport.authenticate('jwt', { session: false });
    let token = req.headers['authorization'];
    let { id } = jwt.decode(token.split(' ')[1]);
    sessionModel.findOne({
        where: {
            userId: id,
            active: true,
            token: token.split(' ')[1]
        }
    }).then((session) => {
        if (session) {
            next()
        } else {
            res.status(401).json({ msg: "You are UnAuthorized!" });
        }
    }).catch((err) => {
        res.status(404).json({ msg: err });
    })
}


exports.UserRoles = (roles_user) => function (req, res, next) {
    let token = req.headers['authorization'];
    let { roles } = jwt.decode(token.split(' ')[1]);
    for (var i = 0; i < roles_user.length; i++) {
        let flag = false;
        for (var j = 0; j < roles.length; j++) {
            if (roles_user[i] === roles[j]) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            res.status(403).json({ msg: "Forbidden Access!" });
        }

    }
    // res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!" });
    next()
}