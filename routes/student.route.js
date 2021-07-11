var express = require('express');
var conf_sercet = require('../config/sercret.json')
let { securedWithToken, decryptReqBody, encrypt, decrypt } = require('../securitylayer/auth')
let { tokenModel } = require('../models/token.model');
let { studentModel } = require('../models/student.model');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { response, request } = require('express');
let { Op, json } = require("sequelize");
const bodyParser = require("body-parser");
const multipart = require('connect-multiparty');
let fs = require('fs')
const multipartMiddleware = multipart({
    uploadDir: './uploads'

},);

var router = express.Router();


router.post('/create',(req, res, next) => {

    req.body.track = req.body.track.toString();
 
    studentModel.create(req.body).then((data) => {
        if (data) return res.send(response = "student was created", status = 200, statusText = "success", statusClass = "success");
        res.send(`${data}`, status = 400);
    }).catch((err) => {

        return res.send(response = "error occured!", status = 500, statusText = "error", statusClass = "danger");
    })
});
router.post('/upload', multipartMiddleware, (req, res, next) => {
    let uploaded_file_name = req.files.file.path
    
    let new_file_name = `./uploads/${req.body.dest_file_name}`
    fs.rename(uploaded_file_name, new_file_name,(err)=>{
        
        res.json({
            'message': 'File uploaded succesfully.'
        });
    })
    
    
});




module.exports = router;
