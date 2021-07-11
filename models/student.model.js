const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const student = sequelize.define("student", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },

    communites_joined: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    major: {
        type: DataTypes.STRING,
        allowNull: false
    },
    minor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postal_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resume: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    source: {
        type: DataTypes.STRING,
        allowNull: false
    },
    track: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    // Other model options go here
});


// user.sync({ force: true });

exports.studentModel = student