const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const n_group = sequelize.define('n_group', {
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
        tableName: 'n_group',
        timestamps: false
    }
);
// user.sync({ force: true });

exports.n_groupModel = n_group