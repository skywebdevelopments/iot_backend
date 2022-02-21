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
    user_id: {
        type: Sequelize.INTEGER,
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