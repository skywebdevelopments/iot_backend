
const log4js_app = require("log4js");
// conf

const app_conf = require('../config/app.conf.json')


// app
log4js_app.configure({
    appenders: { app: { type: "file", filename: app_conf.log_path } },
    categories: { default: { appenders: ["app"], level: app_conf.log_level } }
});


const app_logger = log4js_app.getLogger("app");


exports.log = app_logger