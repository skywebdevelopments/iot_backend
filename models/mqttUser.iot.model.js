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
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
}, {
    tableName: 'mqtt_user',
    timestamps: false
});

// user.sync({ force: true });


exports.mqtt_userModel = mqtt_user