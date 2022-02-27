const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const sensortype = sequelize.define('sensortype', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'sensortype',
        timestamps: false
    }
);



exports.SensorTypeModel = sensortype;