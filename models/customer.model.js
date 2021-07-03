const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const customer = sequelize.define("customer", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    c_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: false
    },
    c_gender: {
        type: DataTypes.STRING,
        allowNull: false
    },

    c_mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    c_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    c_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    c_birthdate: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Other model options go here
});


// user.sync({ force: true });

exports.customerModel = customer