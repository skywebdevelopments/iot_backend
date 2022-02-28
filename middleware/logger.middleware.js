const cryptojs = require('crypto-js');
var secret = require('../config/sercret.json');
var { log } = require('../config/app.conf.json');
var jwt = require("jsonwebtoken");

function create_log(operation, log_level, log_message, req) {

    if (log.database.enable_database_log === true) {
        if (log.database.log_level) {

        }
        let user_id = get_user_id(req);
        logModel.create({
            operation: operation,
            log_level: log_level,
            log_message: log_message,
            user_id: user_id
        })
    }

    if (log.log_file.enable_file_log === true) {
        if (log.log_file.log_level) {

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
            }
        }
    }
    var token_payload = jwt.decode(token);
    var user_id = token_payload.id
    return user_id;
}

module.exports = {
    create_log
}