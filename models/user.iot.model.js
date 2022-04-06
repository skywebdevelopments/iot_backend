const Sequelize = require('sequelize')
const sequelize = require('../database/connection');
const { u_groupModel } = require('./u_group.iot.model');
const { dashboard } = require('./dashboard.iot');

const user = sequelize.define('user', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    googleID: {
        type: Sequelize.STRING
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'user',
        timestamps: false
    }
);

u_groupModel.hasMany(user, { as: 'users'});
user.belongsTo(u_groupModel);
user.belongsTo(dashboard);

exports.userModel = user;