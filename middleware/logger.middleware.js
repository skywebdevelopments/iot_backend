//configs
const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
var logger = require('../config/app.conf.json');
let { log } = require('../logger/app.logger')
let jwt = require('jsonwebtoken')

//models
let { logModel } = require('../models/logger.iot.model')


function write_log_db(operation, log_level, log_message, user_id) {

    logModel.create({
        operation: operation,
        log_level: log_level,
        log_message: log_message,
        user_id: user_id
    })

}

//req_type : outbound request or inbound request
function create_log(operation, log_level, log_message, req_type, uuid, req) {


    let user_id = get_user_id(req);

    if (logger.log.database.enable_database_log === true) {

        if (log.isTraceEnabled()) {

            write_log_db(operation, log_level, log_message, user_id);
        }
        else if (log.isInfoEnabled() && log_level !== logger.log.log_level.trace) {

            write_log_db(operation, log_level, log_message, user_id);
        }
        else if (log.isWarnEnabled() && log_level !== logger.log.log_level.trace
            && log_level !== logger.log.log_level.info) {

            write_log_db(operation, log_level, log_message, user_id)
        }
        else if (log.isErrorEnabled() && log_level !== logger.log.log_level.trace
            && log_level !== logger.log.log_level.info
            && log_level !== logger.log.log_level.warn) {

            write_log_db(operation, log_level, log_message, user_id)
        }

    }

    if (logger.log.log_file.enable_file_log === true) {

        if (log_level === logger.log.log_level.trace) {
            log.trace(`${uuid} - ${log_level} - ${req_type} - ${operation} - ${log_message} - ${user_id}`);
        }
        if (log_level === logger.log.log_level.info) {
            log.info(`${uuid} - ${log_level} - ${req_type} - ${operation} - ${log_message} - ${user_id}`);
        }
        if (log_level === logger.log.log_level.warn) {
            log.warn(`${uuid} - ${log_level} - ${req_type} - ${operation} - ${log_message} - ${user_id}`);
        }
        if (log_level === logger.log.log_level.error) {
            log.error(`${uuid} - ${log_level} - ${req_type} - ${operation} - ${log_message} - ${user_id}`);
        }
    }

}

// Extracts user id from token that is sent in headers of the request
function get_user_id(req) {
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
                return user_id;
            }
        }
    }
    return -1;
}

module.exports = {
    create_log
}