var conf = require('../config/config.json')
const Sequelize = require('sequelize')


// const sequelize = new Sequelize(conf.development.database, conf.development.username, '', { host: conf.development.host, dialect: conf.development.dialect })

const sequelize = new Sequelize(`${conf.development.dialect}://${conf.development.username}:${conf.development.password}@${conf.development.host}:${conf.development.port}/${conf.development.database}`)

module.exports = sequelize;
global.sequelize = sequelize;
