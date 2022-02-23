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
        type: Sequelize.STRING,
        unique: true
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
    }
},
    {
        tableName: 'group',
        timestamps: false
    }
);
// user.sync({ force: true });

exports.groupModel = group