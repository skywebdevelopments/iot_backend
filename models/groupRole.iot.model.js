const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const grouprole = sequelize.define('group_role', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    role: {
        type: Sequelize.STRING,
        unique: true
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'group_role',
        timestamps: false
    }
);



exports.GroupRoleModel = grouprole;