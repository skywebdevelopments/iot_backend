const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const inventory = sequelize.define("inventory", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    i_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    i_quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    i_notes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    i_description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    i_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    i_production_date: {
        type: DataTypes.DATE,
        allowNull: true
    },

}, {
    // Other model options go here
});


// user.sync({ force: true });

exports.inventoryModel = inventory