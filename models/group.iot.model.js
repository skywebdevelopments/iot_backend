const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const group = sequelize.define('group', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN
    }
},
    {
        tableName: 'group',
        timestamps: false
    }
);
// user.sync({ force: true });

exports.groupModel = group