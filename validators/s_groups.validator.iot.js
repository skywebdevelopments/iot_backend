const { body } = require('express-validator');

const get_s_groupByID = [
    body('groupId').isNumeric()
    .withMessage('groupId must contain a numeric input')
];
const s_group_create = [
  body('name').isString()
  .withMessage('group name must contain a string input'),
  body('name').isLength({ min: 3 })
  .withMessage('group name must contain a string of min length 3'),
  body('active').isBoolean()
  .withMessage('group active  must contain a boolean input')
];
const sgroup_sensorMap = [
  body('sensorId').isNumeric()
  .withMessage('sensorId must contain a numeric input'),
  body('group_rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required')
];
const s_group_update = [
  body('rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required'),
  body('name').isString()
  .withMessage('group name must contain a string input'),
  body('name').isLength({ min: 3 })
  .withMessage('group name must contain a string of min length 3'),
  body('active').isBoolean()
  .withMessage('group active  must contain a boolean input')
];
const s_group_delete= [
  body('rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required')
];
module.exports =
 {get_s_groupByID,
  s_group_create,
  sgroup_sensorMap,
  s_group_update,
  s_group_delete
 };