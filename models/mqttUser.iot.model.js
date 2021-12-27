const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const mqtt_user = sequelize.define('mqtt_user', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    is_superuser: {
        type: Sequelize.BOOLEAN
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    }
}, {
    tableName: 'mqtt_user',
    timestamps: false
});

// user.sync({ force: true });


exports.mqtt_userModel = mqtt_user