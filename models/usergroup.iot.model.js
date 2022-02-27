const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const usergroup = sequelize.define('usergroup', {
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
        tableName: 'usergroup',
        timestamps: false
    }
);

// to create table if doesn't exist

exports.usergroupModel = usergroup;