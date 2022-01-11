const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/config.json')
const { userModel } = require('../models/user.iot.model');


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
                    done(null, newUser)
                })

            }

        })



})
)
