const Sequelize = require('sequelize')
const sequelize = require('../database/connection');
let { nodeModel } = require('./node.iot.model')
let { entity_TypeModel } = require('./entity_types.iot.model')

const entity = sequelize.define('entity', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN,
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'entity',
        timestamps: false
    }
);


nodeModel.hasMany(entity, { as: 'entity', onDelete: 'cascade', foreignKey: 'nodeId' });
entity.belongsTo(nodeModel);

entity_TypeModel.hasMany(entity, { as: 'entity', onDelete: 'cascade' });
entity.belongsTo(entity_TypeModel);

exports.entityModel = entity;