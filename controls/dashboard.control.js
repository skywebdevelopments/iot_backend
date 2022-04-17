let dashboardmodel = require('../models_crud/dashboard.model')
let { log } = require('../config/app.conf.json')
let { create_log } = require('./log.control')

var responseList = require('../config/response.code.json')

//configs
const cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var secret = require('../config/sercret.json');


function TokenExtractor(req) {
    var token = null;

    if (req.headers && req.headers['authorization']) {

        var header_token = req.headers['authorization'].split(' ');

        if (header_token.length == 2) {
            var scheme = header_token[0],
                enc_token = header_token[1];

            if (scheme === 'Bearer') {
                token = cryptojs.AES.decrypt(enc_token, secret.token_sercet_key).toString(cryptojs.enc.Utf8);
            }
        }
    }
    return token;
}


function get_dashboard(request_key, req) {

    return new Promise((resolve, reject) => {

        let { id } = jwt.decode(TokenExtractor(req));
        dashboardmodel.getDashboard(id).then(data => {
            if (!data || !data.dashboard || data.length === 0) {
                create_log('get dashboard', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            create_log('get dashboard', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(parse_entity_messages(data))
        }).catch((error) => {
            create_log('get dashboard', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

function get_entity_message(request_key, req) {
    return new Promise((resolve, reject) => {

        let messages = []
        dashboardmodel.getEntityMessages(req).then(data => {
            if (!data || data.length === 0) {
                create_log('get message', log.log_level.info, responseList.error.error_no_data.message, request_key, req)
                reject({ code: responseList.error.error_no_data.code, message: responseList.error.error_no_data.message });
            }
            data.forEach(element => {
                messages.push(element.message)
            });
            create_log('get message', log.log_level.info, responseList.success.sucess_data.message, request_key, req)
            resolve(messages)
        }).catch((error) => {
            create_log('get message', log.log_level.error, error.message, request_key, req)
            reject(error);
        })
    })
}

async function parse_entity_messages(data) {
    let new_data = data

    for (let i = 0; i < data.dashboard.cards.length; i++) {
        await dashboardmodel.getEntityMessages_byId(data.dashboard.cards[i]['entity_id'])
            .then(result => {
                if (!result || result.length === 0) {

                    new_data['dashboard']['cards'][i]['chart_data'] = [];
                }
                let messages = []
                result.forEach(element => {
                    messages.push({ y: element.message, x: element.createdAt })
                });

                new_data['dashboard']['cards'][i]['chart_data'] = messages;

            }).catch((error) => {

                new_data['dashboard']['cards'][i]['chart_data'] = [];
            })

    }

    return new_data
}

function create_new_dashboard(req, userid) {
    return new Promise((resolve, reject) => {
        dashboardmodel.createDashboard(req)
            .then((dashboard) => {
                return dashboardmodel.addDashboardToUser(userid, dashboard.id)
            })
            .then((data) => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

function update_dashboard(req, dashboardid) {
    return new Promise((resolve, reject) => {
        dashboardmodel.getDashboardByID(dashboardid)
            .then((data) => {
                let cards = data.cards;
                cards.push(req.body);
                return dashboardmodel.updateDashboard({ "cards": cards }, dashboardid)
            })
            .then((data) => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

function delete_dashboard(req, request_key) {
    return new Promise((resolve, reject) => {
        let { id } = jwt.decode(TokenExtractor(req));
        dashboardmodel.getDashboard(id)
            .then((data) => {
                let updated_cards = req.body['cards'].map(({ chart_data, ...keepAttrs }) => keepAttrs)
                return dashboardmodel.updateDashboard({ 'cards': updated_cards }, data.dashboard.id)
            })
            .then((data) => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}




function create_dashboard(req, request_key) {
    return new Promise((resolve, reject) => {
        let { id } = jwt.decode(TokenExtractor(req));
        req.body["entity_id"] = parseInt(req.body["entity_id"])
        dashboardmodel.getDashboard(id)
            .then((data) => {
                if (!data.dashboard) {
                    return create_new_dashboard(req, id)
                }
                else {
                    return update_dashboard(req, data.dashboard.id)
                }
            })
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                create_log('create dashboard', log.log_level.error, error.message, request_key, req)
                reject(error);
            })
    })
}
module.exports = {
    get_dashboard,
    get_entity_message,
    create_dashboard,
    delete_dashboard
}