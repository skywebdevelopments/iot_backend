let db = require('../database/knex_connection')
//models
const { logModel } = require('../models/logger.iot.model');


function createLog(operation, log_level, log_message, user_email, parent_rec_id) {

    return logModel.create({
        operation: operation,
        log_level: log_level,
        log_message: log_message,
        user_email: user_email,
        parent_rec_id: parent_rec_id
    })
    
}

module.exports = {
    createLog
}