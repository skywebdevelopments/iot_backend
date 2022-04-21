const Sequelize = require('sequelize')
const sequelize = require('../database/connection');

const entity_types = sequelize.define('entity_types', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'entity_types',
        timestamps: false
    }
);




exports.entity_TypeModel = entity_types;