let db = require('../database/knex_connection')

function createLog(operation, log_level, log_message, user_id) {

    const timestamp = new Date(Date.now());
    return db.knex('log').insert({
        operation: operation,
        log_level: log_level,
        log_message: log_message,
        user_id: user_id,
        createdAt: timestamp,
        updatedAt: timestamp
    })
}

module.exports = {
    createLog
}