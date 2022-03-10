let db = require('../database/knex_connection')
//models
const { logModel } = require('../models/logger.iot.model');


function createLog(operation, log_level, log_message, user_id) {

    return logModel.create({
        operation: operation,
        log_level: log_level,
        log_message: log_message,
        user_id: user_id
    })
    
}

module.exports = {
    createLog
}