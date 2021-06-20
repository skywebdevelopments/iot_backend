const log4js = require("log4js");
const conf = require('../redis/app_conf/app.conf.json');


log4js.configure({
    appenders: { app: { type: "file", filename: conf.log_file} },
    categories: { default: { appenders: ["app"], level: "error" } }
});
log4js.configure({
    appenders: { app: { type: "file", filename: conf.log_file} },
    categories: { default: { appenders: ["app"], level: "info" } }
});

const logger = log4js.getLogger("app");


exports.log = logger