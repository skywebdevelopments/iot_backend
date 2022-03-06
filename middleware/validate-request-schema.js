const { validationResult } = require('express-validator');
let { create_log } = require('../middleware/logger.middleware');
function validateRequestSchema(req,res,next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //create_log('list sensor group with ID', log.log_level.error, responseList.error.error_invalid_payload.message, log.req_type.inbound, request_key, req)
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
module.exports = {validateRequestSchema };