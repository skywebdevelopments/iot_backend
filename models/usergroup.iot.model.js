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
    active:{
        type: Sequelize.BOOLEAN
    }
},
{
    tableName: 'usergroup',
    timestamps: false
}
);

// to create table if doesn't exist

exports.usergroupModel = usergroup;