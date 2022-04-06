const Sequelize = require('sequelize')
const sequelize = require('../database/connection');


const dashboard = sequelize.define('dashboard', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cards: {
        type: Sequelize.JSON
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
    }
},
    {
        tableName: 'dashboard',
        timestamps: false
    }
);

// to create table if doesn't exist

exports.dashboard = dashboard;