const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const u_group = sequelize.define('u_group', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    groupname: {
        type: Sequelize.STRING
    },
    roles: {
        type: Sequelize.JSON
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
        tableName: 'u_group',
        timestamps: false
    }
);

// to create table if doesn't exist

exports.u_groupModel = u_group;