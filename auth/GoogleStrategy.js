const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/config.json')
let { uuid } = require('uuidv4');
//controls
let userControl = require('../controls/user.control')
//configs
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

passport.use(new GoogleStrategy({
    // Options of google sterategy
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecrete,
    callbackURL: keys.google.callbackURL

},(accessToken, refreshToken, profile, done) => {
    let request_key = uuid();
    userControl.google_user(profile, profile.emails[0].value, request_key)
    .then((data) => {
        if(data.data==='deactivated')
        localStorage.setItem('token', 'deactivated'); 
        else
        localStorage.setItem('token', data.data['token']); 
        done(null, data)
    }).catch((error) => {
        done(null, error)
    })
})
)