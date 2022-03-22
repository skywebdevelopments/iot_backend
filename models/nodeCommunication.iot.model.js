const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

let { communicationModel } = require('./communication.iot.model');
let { nodeModel } = require('./node.iot.model');


const node_communication = sequelize.define('node_communication', {},
  {
    tableName: 'node_communication',
    timestamps: false
  });

nodeModel.belongsToMany(communicationModel, { through: 'node_communication', as: 'communication', onDelete: 'cascade' });
communicationModel.belongsToMany(nodeModel, { through: 'node_communication', as: 'node', onDelete: 'cascade' });


exports.node_communicationModel = node_communication;