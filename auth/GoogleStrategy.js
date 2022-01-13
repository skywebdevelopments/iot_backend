const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var authenticate = require('../auth/authentication_JWT');
const keys = require('../config/config.json')
const { userModel } = require('../models/user.iot.model');
let { sessionModel } = require('../models/session.iot.model');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

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
                userModel.create({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleID: profile.id,
                    active: true
                }).then((newUser) => {
                    generate_session_google(newUser)
                    done(null, newUser)
                })

            }

        })



})
)


function generate_session_google(user) {
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
            localStorage.setItem('token',token); //to store token in local storage 
         
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
        localStorage.setItem('token',token); //to store token in local storage 
     
    })
}