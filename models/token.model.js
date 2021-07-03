const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const token = sequelize.define("token", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    user_email: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    token_key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token_expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW 
    },

}, {
    // Other model options go here
});


// token.sync({ force: true });



exports.tokenModel = token