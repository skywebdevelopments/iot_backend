const { validationResult } = require('express-validator');

function validateRequestSchema(req, res, next) {

  console.log('***********************************************Errors***********')
  console.log(req.body)
  console.log('***********************************************Errors***********')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validateRequestSchema };
