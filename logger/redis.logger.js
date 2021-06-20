const log4js_redis = require("log4js");

// conf
const conf = require('../redis/app_conf/app.conf.json');


// redis
log4js_redis.configure({
    appenders: { redis: { type: "file", filename: conf.log_file } },
    categories: { default: { appenders: ["redis"], level: conf.log_level } }
});



const redis_logger = log4js_redis.getLogger("redis");


exports.log = redis_logger
