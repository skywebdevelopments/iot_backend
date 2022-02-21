var express = require('express');
let { logModel } = require('../models/logger.iot.model')
var router = express.Router();
var responseList = require('../config/response.code.json')


router.get('/log', function (req, res, next) {
    // code block
    // 1. db_operation: select all query
    logModel.findAll().then((data) => {
        // 2. return data in a response.
        if (!data || data.length === 0) {
            res.send(
                { status: responseList.error.error_no_data }
            );
        }
        // send the response.
        res.send({ data: data, status: responseList.success });
        //end
    }).catch((error) => {
        res.send(error.message)
    });
});
module.exports = router;