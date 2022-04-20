const { body } = require('express-validator');

const get_n_groupByID = [
    body('groupId').isNumeric()
    .withMessage('groupId must contain a numeric input')
];
const n_group_create = [
  body('name').isString()
  .withMessage('group name must contain a string input'),
  body('name').isLength({ min: 3 })
  .withMessage('group name must contain a string of min length 3'),
  body('active').isBoolean()
  .withMessage('group active  must contain a boolean input')
];
const ngroup_nodeMap = [
  body('nodeId').isNumeric()
  .withMessage('nodeId must contain a numeric input'),
  body('rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required')
];
const n_group_update = [
  body('rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required'),
  body('name').isString()
  .withMessage('group name must contain a string input'),
  body('name').isLength({ min: 3 })
  .withMessage('group name must contain a string of min length 3'),
  body('active').isBoolean()
  .withMessage('group active  must contain a boolean input')
];
const n_group_delete= [
  body('rec_id').exists({checkFalsy:true})
  .withMessage('group rec id is required')
];
const n_group_delete_relation= [
  body('nodeId').exists({checkFalsy:true})
  .withMessage('Node Id is required'),
  body('nGroupId').exists({checkFalsy:true})
  .withMessage('nGroup Id is required')
];
module.exports =
 {get_n_groupByID,
  n_group_create,
  ngroup_nodeMap,
  n_group_update,
  n_group_delete,
  n_group_delete_relation
 };