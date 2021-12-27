const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');
let {groupModel} = require('./group.iot.model');
let {sensorModel} = require('./sensor.iot.model');


const sensor_group = sequelize.define('sensor_group', {},
    {
        tableName: 'sensor_group',
        timestamps: false
    });

sensorModel.belongsToMany(groupModel, { through: 'sensor_group', as: 'group', onDelete: 'cascade' });
groupModel.belongsToMany(sensorModel, { through: 'sensor_group', as: 'sensor', onDelete: 'cascade' });


// user.sync({ force: true });

exports.sensor_groupModel = sensor_group