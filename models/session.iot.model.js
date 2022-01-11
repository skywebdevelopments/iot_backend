const Sequelize = require('sequelize')
const sequelize = require('../database/connection');
let { userModel } = require('./user.iot.model');

const session = sequelize.define('session', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN
    },
},
    {
        tableName: 'session',
        timestamps: false
    }
);

userModel.hasMany(session, { as: 'sessions' });


exports.sessionModel = session;