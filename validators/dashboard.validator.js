const { body } = require('express-validator');

const createdashboardSchema = [
    body('card_header')
        .isLength({ min: 4 })
        .withMessage('chart_header must be at least 4 characters long'),
    body('chart_title')
        .isLength({ min: 4 })
        .withMessage('chart_title must be at least 4 characters long'),
    body('chart_type')
        .isLength({ min: 2 })
        .withMessage('chart_type must be at least 2 characters long'),
    body('card_type')
        .isLength({ min: 4 })
        .withMessage('card_type must be at least 4 characters long'),
    body('entity_id')
        .isNumeric()
        .withMessage('entity id must be at least 1 characters long'),

];


module.exports = {
    createdashboardSchema
};