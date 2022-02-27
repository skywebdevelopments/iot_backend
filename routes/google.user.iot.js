const router = require('express').Router();
const { Router } = require('express');
const passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

// GET /api/v1/googleusers
// Return  google user
//Auth with google
router.get('/', passport.authenticate('google', {
    //Telling passoprt what i want to retrieve profile or emails
    scope: ['profile', 'email']
}))


// GET /api/v1/googleusers/callback
// Callback URL ( redirectURL )
router.get('/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.cookie('token', localStorage.getItem('token'), { maxAge: 360000 });
    res.redirect("http://localhost:4200/(first:index)")
})



module.exports = router;

