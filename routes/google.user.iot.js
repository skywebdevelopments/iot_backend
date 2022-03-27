const router = require('express').Router();
const { Router } = require('express');
const passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
var jwt = require('jsonwebtoken');
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
        res.redirect("http://localhost:4200/dashboard")
    }
    else {
        res.cookie("token", localStorage.getItem("token"), { maxAge: 360000 });
        res.redirect("http://localhost:4200")
    }
})



module.exports = router;

