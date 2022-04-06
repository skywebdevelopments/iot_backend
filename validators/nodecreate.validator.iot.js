const { body } = require('express-validator');

const createnodeSchema = [
  body('mac_address')
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/)
    .exists({ checkFalsy: true }),
  body('client_id')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage('Cliendt Id must be at least 4 characters long'),
  body('active')
    .isBoolean()
    .exists({ checkFalsy: true }),
  body('ota_password')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Ota Password must be at least 4 characters long'),
  body('ap_password')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Access Point Password must be at least 4 characters long'),
  body('dns1')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Dns1 must be at least 4 characters long'),
  body('dns2')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Dns2 must be at least 4 characters long'),
  body('gateway')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Gateway must be at least 4 characters long'),
  body('subnet')
    .matches(/255|254|252|248|240|224|192|128|0+/)
    .exists({ checkFalsy: true }),
  body('serial_number')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Serial Number must be at least 4 characters long'),
  body('sleep_time')
    .exists({ checkFalsy: true })
    .isNumeric(),
  body('ap_name')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Access Point Name must be at least 4 characters long'),
  body('node_profile')
    .isLength({ min: 3 })
    .exists({ checkFalsy: true })
    .withMessage('Node Profile must be at least 3 characters long'),
  body('board_name')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage('Board Name must be at least 4 characters long'),
    body('friendly_name')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage('Friendly Name must be at least 4 characters long'),
  body('board_model')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage('Board Model must be at least 4 characters long'),
  body('sim_serial')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Sim serial must be at least 4 characters long'),
  body('flags')
    .isLength({ min: 4 })
    .exists({ checkFalsy: true })
    .withMessage('Flags must be at least 4 characters long'),
  body('mqttuserId')
    .isLength({ min: 1 })
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage('MqttUser Id must be at least 1 characters long'),
  body('static_ip')
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)
    .optional({ nullable: true }),
  body('ap_ip')
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)
    .optional({ nullable: true }),
  body('host_ip')
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/)
    .optional({ nullable: true }),
  body('sim_msidm')
    .matches(/[0-9]{11}/)
    .optional({ nullable: true }),
];


const RequiredRec_Id = [
  body('rec_id')
    .exists({ checkFalsy: true })
    .withMessage('Rec Id is required'),
]

const updatenodeSchema = [
  
  body('board_model')
    .isLength({ min: 4 })
    .optional({ nullable: true })
    .withMessage('Board Model must be at least 4 characters long'),
  
];

module.exports = {
  createnodeSchema,
  RequiredRec_Id,
  updatenodeSchema
};