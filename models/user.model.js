const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const user = sequelize.define("user", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    user_email: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    user_password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    user_role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
}, {
    // Other model options go here
});


// user.sync({ force: true });

exports.userModel = user