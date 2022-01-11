const passport = require("passport");
const passportJwt = require('passport-jwt'); // we use it for startegy used to extract the actual jwt password
const ExtractJwt = passportJwt.ExtractJwt;
const StartegyJwt = passportJwt.Strategy;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let { sessionModel } = require('../models/session.iot.model');
var config = require('../config/config.json');


// sign a token (create a token for a user)
exports.getToken = function (user) {
    const id = user.id;
    const expiresIn = "1d";
    const payload = {
        id: id,
        iat: Date.now(),
    };
    
    const signedToken = jwt.sign(payload, config.secretKey, {
        expiresIn: expiresIn
    });
    return "Bearer " + signedToken

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
                        active:true
                    }
                }
            ).then((session) => {
                return done(null, session); //it works
            }).catch((err) => {
                    return done(err);
            });
        })
);

exports.verifyUser = passport.authenticate('jwt', { session: false }); // veify using jwt staregy and set session to false as we will not use it 

exports.authenticateUser= function (req, res, next) {

    let token = req.headers['authorization'];
    let { id } = jwt.decode(token.split(' ')[1]);

    sessionModel.findOne({
        where: {
            userId: id,
            active: true,
            token: token
        }
    }).then((session) => {
        if (session) {
            res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!" });
        } else {
            res.status(401).json({ msg: "You are UnAuthorized!" });
        }
    }).catch((err) => {
        res.status(404).json({ msg: err });
    })
}