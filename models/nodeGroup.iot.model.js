const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');
let {n_groupModel} = require('./n_group.iot.model');
let {nodeModel} = require('./node.iot.model');


const node_group = sequelize.define('node_group', {},
    {
        tableName: 'node_group',
        timestamps: false
    });

nodeModel.belongsToMany(n_groupModel, { through: 'node_group', as: 'n_group', onDelete: 'cascade' });
n_groupModel.belongsToMany(nodeModel, { through: 'node_group', as: 'node', onDelete: 'cascade' });


// user.sync({ force: true });

exports.node_groupModel = node_group