const router = require('express').Router();
const { Router } = require('express');
const passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

//Auth with google
//after auth i write the strategy (here is : Google)
router.get('/google', passport.authenticate('google', {
    //Telling passoprt what i want to retrieve profile or emails
    scope: ['profile', 'email']
}))



// Callback URL ( redirectURL )
router.get('/google/callback', passport.authenticate('google', { session: false,assignProperty:'userProfile' }), (req, res) => {

    res.cookie('token', localStorage.getItem('token'), {
        maxAge: 60000, // Lifetime
    })
    res.redirect("http://localhost:4200/pages/iot-dashboard")
})


module.exports = router;
