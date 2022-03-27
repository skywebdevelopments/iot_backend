const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var authenticate = require('../auth/authentication_JWT');
const keys = require('../config/config.json')
const { userModel } = require('../models/user.iot.model');
let { sessionModel } = require('../models/session.iot.model');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
let { u_groupModel } = require('../models/u_group.iot.model')

passport.use(new GoogleStrategy({
    // Options of google sterategy
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecrete,
    callbackURL: keys.google.callbackURL

}, (accessToken, refreshToken, profile, done) => {
    //passport callback function

    ///check if the user already exist in my database
    userModel.findOne(
        {
            where:
            {
                googleID: profile.id
            },
            include: {
                model: u_groupModel
            }
        }).then((currentUser) => {
            if (currentUser) {
                //User Already exist
                generate_session_google(currentUser)
                done(null, currentUser)
            }
            else {
                //User Not exist
                //save data of profile in database
                u_groupModel.findOne({
                    where: {
                        groupname: 'public'
                    }
                }).then(data => {
                    userModel.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        googleID: profile.id,
                        active: true,
                        uGroupId: data.id
                    }
                    ).then((newUser) => {
                        userModel.findOne(
                            {
                                where:
                                {
                                    id: newUser.id
                                },
                                include: {
                                    model: u_groupModel
                                }
                            }).then((newUser) => {
                                generate_session_google(newUser)
                                done(null, newUser)
                            })
                    })
                })
            }
        })
})
)


function generate_session_google(user) {
    if (user['active'] === true) {
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
        localStorage.setItem('token', token); //to store token in local storage 
    }
    else
        localStorage.setItem('token', 'deactivated');
}