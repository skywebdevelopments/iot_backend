const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');
let { mqtt_userModel } = require('../models/mqttUser.iot.model')
let { SensorTypeModel } = require('../models/sensortype.iot.model')
const sensor = sequelize.define('sensor', {
    // Model attributes are defined here
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    mac_address: {
        type: Sequelize.STRING
    },
    client_id: {
        type: Sequelize.STRING
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    ota_password: {
        type: Sequelize.STRING
    },
    static_ip: {
        type: Sequelize.STRING
    },
    dns1: {
        type: Sequelize.STRING
    },
    dns2: {
        type: Sequelize.STRING
    },
    gateway: {
        type: Sequelize.STRING
    },
    subnet: {
        type: Sequelize.STRING
    },
    serial_number: {
        type: Sequelize.STRING
    },
    subnet: {
        type: Sequelize.STRING
    },
    sleep_time: {
        type: Sequelize.INTEGER
    },
    ap_name: {
        type: Sequelize.STRING
    },
    ap_ip: {
        type: Sequelize.STRING
    },
    ap_password: {
        type: Sequelize.STRING
    },
    node_profile: {
        type: Sequelize.INTEGER
    },
    host_ip: {
        type: Sequelize.STRING
    },
    board_name: {
        type: Sequelize.STRING
    },
    board_model: {
        type: Sequelize.STRING
    },
    sim_serial: {
        type: Sequelize.STRING
    },
    sim_msidm: {
        type: Sequelize.STRING
    },
    flags: {
        type: Sequelize.STRING
    },
    rec_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false

    }
},
    {
        tableName: 'sensor',
        timestamps: false
    }

);
// user.sync({ force: true });


sensor.belongsTo(mqtt_userModel, { foreignKey: 'mqttuserId' ,onDelete: 'cascade'});
sensor.belongsTo(SensorTypeModel, { foreignKey: 'sensorTypeId' ,onDelete: 'cascade'});


exports.sensorModel = sensor