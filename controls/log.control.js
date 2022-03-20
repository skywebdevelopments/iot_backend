//configs
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
var logger = require('../config/app.conf.json');
let { log } = require('../logger/app.logger')
let jwt = require('jsonwebtoken')

//model
let logmodel = require('../models_crud/log.model');
let { userModel } = require('../models/user.iot.model');

function create_log(operation, log_level, log_message, parent_uuid, req) {

    let user_email = get_user_email(req);

    if (user_email === -1) {
        user_email = req
    }


    if (logger.log.database.enable_database_log === true) {

        if (log.isTraceEnabled()) {
            logmodel.createLog(operation, log_level, log_message, user_email, parent_uuid).then().catch(err => console.log(err))
        }
        else if (log.isInfoEnabled() && log_level !== logger.log.log_level.trace) {

            logmodel.createLog(operation, log_level, log_message, user_email, parent_uuid).then().catch(err => console.log(err))
        }
        else if (log.isWarnEnabled() && log_level !== logger.log.log_level.trace
            && log_level !== logger.log.log_level.info) {

            logmodel.createLog(operation, log_level, log_message, user_email, parent_uuid).then().catch(err => console.log(err))
        }
        else if (log.isErrorEnabled() && log_level !== logger.log.log_level.trace
            && log_level !== logger.log.log_level.info
            && log_level !== logger.log.log_level.warn) {

            logmodel.createLog(operation, log_level, log_message, user_email, parent_uuid).then().catch(err => console.log(err))
        }

    }

    if (logger.log.log_file.enable_file_log === true) {

        if (log_level === logger.log.log_level.trace) {
            log.trace(`${parent_uuid} - ${log_level} - ${operation} - ${log_message} - ${user_email}`);
        }
        if (log_level === logger.log.log_level.info) {
            log.info(`${parent_uuid} - ${log_level} - ${operation} - ${log_message} - ${user_email}`);
        }
        if (log_level === logger.log.log_level.warn) {
            log.warn(`${parent_uuid} - ${log_level} - ${operation} - ${log_message} - ${user_email}`);
        }
        if (log_level === logger.log.log_level.error) {
            log.error(`${parent_uuid} - ${log_level} - ${operation} - ${log_message} - ${user_email}`);
        }
    }


}

// Extracts user id from token that is sent in headers of the request
function get_user_email(req) {
    var token = null;

    if (req.headers && req.headers['authorization']) {

        var header_token = req.headers['authorization'].split(' ');

        if (header_token.length == 2) {
            var scheme = header_token[0],
                enc_token = header_token[1];

            if (scheme === 'Bearer') {
                token = cryptojs.AES.decrypt(enc_token, secret.token_sercet_key).toString(cryptojs.enc.Utf8);
                var token_payload = jwt.decode(token);
                var user_id = token_payload.id
                userModel.findOne({
                    where: {
                        id: user_id
                    }
                }).then(data)
                {
                    console.log("**************************************************************")
                    console.log(data['email'])
                    console.log("**************************************************************")
                    return data['email'];
                }
            }
        }
    }
    return -1;
}

module.exports = {
    create_log
}