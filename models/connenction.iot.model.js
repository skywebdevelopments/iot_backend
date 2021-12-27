const Sequelize = require("sequelize")
const sequelize = require('../database/connection');

let sensor = require('./sensor');

const connection = sequelize.define("connection", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  connenct_status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  created_time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  expiry_interval: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  keep_alive: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subscription_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  session_key: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
},
  {
    tableName: 'connection',
    timestamps: false
  });


sensor.hasMany(connection, { as: 'connections' });


exports.connectionModel = connection