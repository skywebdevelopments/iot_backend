const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

let { usergroupModel } =  require('./usergroup.iot.model');

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
    email:{
        type: Sequelize.STRING
    },
    active:{
        type: Sequelize.BOOLEAN
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

usergroupModel.hasMany( user, { as: 'users' } );
exports.userModel = user;