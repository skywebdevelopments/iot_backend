const router = require('express').Router();
const passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

//usercontrols
let userControl = require('../controls/user.control')
let { uuid } = require('uuidv4');


// GET /auth
// Return  google user
//Auth with google
router.get('/google', passport.authenticate('google', {
    //Telling passoprt what i want to retrieve profile or emails
    scope: ['profile', 'email']
}))


// GET /auth/google/callback
// Callback URL ( redirectURL )
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    //we need to check for token to redirect 
    if (localStorage.getItem("token") !== 'deactivated') {
        res.cookie("token", localStorage.getItem("token"), { maxAge: 360000 });
        res.redirect("http://localhost:4200/dash")
    }
    else {
        res.cookie("token", localStorage.getItem("token"), { maxAge: 360000 });
        res.redirect("http://localhost:4200")
    }
})

//for react google login
router.post('/api/google-login', (req, res) => {
    const { profile } = req.body;
    let request_key = uuid();
    userControl.google_user(profile, profile.email, request_key)
    .then((data) => {
        if(data.data==='deactivated'){
        res.send({ data:'deactivated', status: 200})
        }
        else{
        res.send({ data:data.data['token'], status: 200})
        }
    }).catch((error) => {
        res.send(error)
    })
  });



module.exports = router;

