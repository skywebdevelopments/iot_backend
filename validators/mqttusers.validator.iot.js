const { body } = require('express-validator');

const mqttuser_create = [
    body('is_superuser').isBoolean()
    .withMessage('mqtt is_superuser must contain a boolean input'),
    body('salt').isString().optional({ nullable: true })
    .withMessage('mqtt salt must contain a string input'),
    body('username').isString()
    .withMessage('mqtt username must contain a string input'),
    body('password').isLength({ min: 5 })
    .withMessage('mqtt password must contain a min length 5')
  ];

  const mqttuser_update = [
    body('rec_id').exists({checkFalsy:true})
    .withMessage('mqttuser rec id is required'),
    body('is_superuser').isBoolean()
    .withMessage('mqtt is_superuser must contain a boolean input'),
    body('salt').isString().optional({ nullable: true })
    .withMessage('mqtt salt must contain a string input'),
    body('username').isString()
    .withMessage('mqtt username must contain a string input'),
    body('password').isLength({ min: 5 })
    .withMessage('mqtt password must contain a min length 5')
  ];
 
  const mqttuser_delete = [
    body('rec_id').exists({checkFalsy:true})
    .withMessage('mqttuser rec id is required')
  ];

  module.exports =
 {
     mqttuser_create,
     mqttuser_update,
     mqttuser_delete
 };