const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const sensortype = sequelize.define('sensor_type', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING,
        unique: true
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'sensor_type',
        timestamps: false
    }
);



exports.SensorTypeModel = sensortype;