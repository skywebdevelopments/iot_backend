const { body } = require('express-validator');

const createentitySchema = [
    body('type')
        .isLength({ min: 4 })
        .exists({ checkFalsy: true })
        .withMessage('Entity must be at least 4 characters long'),
    body('name')
    .isLength({ min: 4 })
    .withMessage('Entity must be at least 4 characters long'),

];


const RequiredRec_Id = [
    body('rec_id')
        .exists({ checkFalsy: true })
        .withMessage('Rec Id is required'),
]

const updateentitySchema = [
    body('type')
        .isLength({ min: 4 })
        .optional({ nullable: true })
        .withMessage('Entity must be at least 4 characters long'),
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