const { body } = require('express-validator');

const createentitySchema = [
    body('entityTypeId')
    .isNumeric()
    .exists({ checkFalsy: true })
    .withMessage('Entity type Id must be at least 1 characters long'),
    body('name')
        .isLength({ min: 4 })
        .exists({ checkFalsy: true })
        .withMessage('Entity must be at least 4 characters long'),
    body('nodeId')
        .isNumeric()
        .exists({ checkFalsy: true })
        .withMessage('Node Id must be at least 1 characters long'),

];


const RequiredRec_Id = [
    body('rec_id')
        .exists({ checkFalsy: true })
        .withMessage('Rec Id is required'),
]

const updateentitySchema = [
    body('name')
        .isLength({ min: 4 })
        .optional({ nullable: true })
        .withMessage('Entity must be at least 4 characters long'),


];

module.exports = {
    createentitySchema,
    RequiredRec_Id,
    updateentitySchema
};