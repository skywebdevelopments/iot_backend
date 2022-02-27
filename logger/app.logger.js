
const log4js_app = require("log4js");
// conf

const app_conf = require('../config/app.conf.json')
let date = new Date()

// app - logs rotates every an hour
log4js_app.configure({
    appenders: { app: { type: "file", filename: `${app_conf.log.log_file.log_path}/${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getHours()}.log` } },
    categories: { default: { appenders: ["app"], level: app_conf.log.log_file.log_level } }
});


const app_logger = log4js_app.getLogger("app");


exports.log = app_logger