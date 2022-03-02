var conf = require('../config/config.json')
const Sequelize = require('sequelize');
const { ConnectionRefusedError } = require('sequelize');

const knex = require('knex')({
    client: 'postgres',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : conf.development.username,
      password : conf.development.password,
      database : conf.development.database
    }
  });


// const sequelize = new Sequelize(conf.development.database, conf.development.username, '', { host: conf.development.host, dialect: conf.development.dialect })

const sequelize = new Sequelize(`${conf.development.dialect}://${conf.development.username}:${conf.development.password}@${conf.development.host}:${conf.development.port}/${conf.development.database}`)


// const sequlize = new Sequelize("postgres://root:root@localhost:5432/clientapp")


module.exports = sequelize;
global.sequelize = sequelize;

module.exports = knex;
global.knex = knex;