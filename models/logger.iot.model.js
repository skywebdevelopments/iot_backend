const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const log = sequelize.define('log', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    operation: {
        type: Sequelize.STRING
    },
    log_message: {
        type: Sequelize.TEXT
    },
    log_level: {
        type: Sequelize.STRING
    },
    user_email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    child_rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    },
    parent_rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'log'
        //timestamps: false
    }
);

// to create table if doesn't exist

exports.logModel = log;