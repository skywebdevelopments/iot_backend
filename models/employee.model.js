const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const employee = sequelize.define("employee", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    e_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: false
    },
    e_gender: {
        type: DataTypes.STRING,
        allowNull: false
    },

    e_mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    e_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    e_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    e_birthdate: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Other model options go here
});


// user.sync({ force: true });

exports.employeeModel = employee