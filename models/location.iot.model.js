const Sequelize = require("sequelize")
const sequelize = require('../database/connection');
let {sensorModel} = require('./sensor.iot.model');

const location = sequelize.define("location", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  latitude: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  latitude: {
    type: Sequelize.FLOAT,
    allowNull: false,
  }
},
  {
    tableName: 'location',
    timestamps: false
  }
);


location.belongsTo(sensorModel);


exports.locationModel = location;