const Sequelize = require("sequelize")
const sequelize = require('../database/connection');
let { nodeModel } = require('./node.iot.model');

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
  }, rec_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false

  }
},
  {
    tableName: 'location',
    timestamps: false
  }
);


location.belongsTo(nodeModel);


exports.locationModel = location;