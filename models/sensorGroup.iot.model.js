const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');
let {s_groupModel} = require('./s_group.iot.model');
let {sensorModel} = require('./sensor.iot.model');


const sensor_group = sequelize.define('sensor_group', {},
    {
        tableName: 'sensor_group',
        timestamps: false
    });

sensorModel.belongsToMany(s_groupModel, { through: 'sensor_group', as: 's_group', onDelete: 'cascade' });
s_groupModel.belongsToMany(sensorModel, { through: 'sensor_group', as: 'sensor', onDelete: 'cascade' });


// user.sync({ force: true });

exports.sensor_groupModel = sensor_group