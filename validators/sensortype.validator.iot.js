const { body } = require('express-validator');

const createsensortypeSchema = [
    body('type')
        .isLength({ min: 4 })
        .exists({ checkFalsy: true })
        .withMessage('Sensor Type must be at least 4 characters long'),
    body('active')
        .isBoolean()
        .exists({ checkFalsy: true }),

];


const RequiredRec_Id = [
    body('rec_id')
        .exists({ checkFalsy: true })
        .withMessage('Rec Id is required'),
]

const updatesensortypeSchema = [
    body('type')
        .isLength({ min: 4 })
        .optional({ nullable: true })
        .withMessage('Sensor Type must be at least 4 characters long'),
    body('active')
        .isBoolean()
        .optional({ nullable: true })


];

module.exports = {
    createsensortypeSchema,
    RequiredRec_Id,
    updatesensortypeSchema
};