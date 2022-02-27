let { s_groupModel } = require('../models/s_group.iot.model')
const { Op } = require("sequelize");
let { log } = require('../logger/app.logger')
function resolve_group_id(req, res, next) {
    let group_rec_id = req.body['group_rec_id']

    // get the pk by rec_id

    s_groupModel.findOne(
        {
            where:
            {
                rec_id: {
                    [Op.eq]: group_rec_id
                }
            }
        }
    ).then(data => {
        req.body.group_pk = data['id']
        next();
    }).catch(error => {
        log.trace(`ERROR - inbound request - update sensor mapping - ${error}`);
    })

}




module.exports = {
    resolve_group_id
}