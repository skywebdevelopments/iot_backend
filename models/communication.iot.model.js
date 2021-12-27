const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const communication = sequelize.define('communication', {
   
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN
    }
    ,
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'communication',
        timestamps: false
    }
);

exports.communicationModel = communication