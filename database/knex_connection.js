var conf = require('../config/config.json')
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

module.exports = {knex}


global.knex  = knex