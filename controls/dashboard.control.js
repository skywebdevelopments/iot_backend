let dashboardmodel = require('../models_crud/dashboard.model')
let { log } = require('../config/app.conf.json')
let { create_log } = require('./log.control')

var responseList = require('../config/response.code.json')

//configs
const cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var secret = require('../config/sercret.json');

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


function get_dashboard(request_key, req) {

    return new Promise((resolve, reject) => {

        let { id } = jwt.decode(TokenExtractor(req));
        dashboardmodel.getDashboard(id).then(data => {
            if (!data || data.length === 0) {
                create_log('get dashboard', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('get dashboard', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('get dashboard', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function get_entity_message(request_key, req) {
    return new Promise((resolve, reject) => {

        dashboardmodel.getEntityMessage(req).then(data => {
            if (!data || data.length === 0) {
                create_log('get entity', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('get entity', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(data)
        }).catch((error) => {
            create_log('get entity', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

module.exports = {
    get_dashboard,
    get_entity_message
}