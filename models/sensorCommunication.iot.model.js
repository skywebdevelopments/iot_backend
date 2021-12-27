const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

let { communicationModel } = require('./communication.iot.model');
let { sensorModel } = require('./sensor.iot.model');


const sensor_communication = sequelize.define('sensor_communication', {},
  {
    tableName: 'sensor_communication',
    timestamps: false
  });

sensorModel.belongsToMany(communicationModel, { through: 'sensor_communication', as: 'communication', onDelete: 'cascade' });
communicationModel.belongsToMany(sensorModel, { through: 'sensor_communication', as: 'sensor', onDelete: 'cascade' });


exports.sensor_communicationModel = sensor_communication;