const Sequelize = require('sequelize')
const sequelize = require('../database/connection');
let { entityModel } = require('./entity.iot.model')

const message = sequelize.define('message', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: Sequelize.TEXT
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'message'
    }
);


entityModel.hasMany(message, { as: 'message', onDelete: 'cascade', foreignKey: 'entityId' });
message.belongsTo(entityModel);

exports.messageModel = message;