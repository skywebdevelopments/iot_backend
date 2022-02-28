const passport = require("passport");
const passportJwt = require('passport-jwt'); // we use it for startegy used to extract the actual jwt password
const ExtractJwt = passportJwt.ExtractJwt;
const StartegyJwt = passportJwt.Strategy;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let { sessionModel } = require('../models/session.iot.model');
var secret = require('../config/sercret.json');
const cryptojs = require('crypto-js');
var responseList = require('../config/response.code.json')



// sign a token (create a token for a user)
exports.getToken = function (user) {
    const id = user.id;
    const name = user.username;
    const roles = user.roles;
    // const usergroup = user['usergroup'];
    // const roles = new Set();
    // console.log(usergroup)
    // for(var userProfile of usergroup){
    //     for(var role of userProfile['roles']){
    //         roles.add(role);
    //     }
    // }

    const expiresIn = "1d";
    const payload = {
        id: id,
        name: name,
        // roles: Array.from(roles),
        roles: roles,
        iat: Date.now(),
    };

    const signedToken = jwt.sign(payload, secret.secretKey, {
        expiresIn: expiresIn
    });

    console.log(signedToken)
    return cryptojs.AES.encrypt(signedToken, secret.token_sercet_key).toString();

}

function TokenExtractor(req) {
    var token = null;

    if (req.headers && req.headers['authorization']) {

        var header_token = req.headers['authorization'].split(' ');

        if (header_token.length == 2) {
            var scheme = header_token[0],
                enc_token = header_token[1];

            if (scheme === 'Bearer') {
                token = cryptojs.AES.decrypt(enc_token, secret.token_sercet_key).toString(cryptojs.enc.Utf8);
            }
        }
    }
    return token;
}

//options used in passport token startegy 
var opts = {}; //options for jwt passport
opts.jwtFromRequest = TokenExtractor; // extract from header l token
opts.secretOrKey = secret.secretKey; // l secret key bt3 l token mn l secret file
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

    let header_token = ""

    if (req.headers['authorization']) {
        header_token = req.headers['authorization']
        header_token = header_token.split(' ')[1];
    }

    sessionModel.findOne({
        where: {
            active: true,
            token: header_token
        }
    }).then((session) => {
        if (session) {
            next()
        } else {
            res.send({ status: responseList.error.error_unauthorized.message, code: responseList.error.error_unauthorized.code })
        }
    }).catch((err) => {
        res.send({ status: err, code: responseList.error.error_not_found.code })
    })
}

exports.UserRoles = (roles_user) => function (req, res, next) {
    var token = TokenExtractor(req);
    let { roles } = jwt.decode(token);
    for (var i = 0; i < roles_user.length; i++) {
        let flag = false;
        for (var j = 0; j < roles.length; j++) {
            if (roles_user[i] === roles[j]) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            res.send({ status: responseList.error.error_forbidden_access.message, code: responseList.error.error_forbidden_access.code })
        }
    }
    next()
}