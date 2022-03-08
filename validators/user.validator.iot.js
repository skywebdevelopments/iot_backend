var { body } = require('express-validator')

const createUserValidator = [
    body('email')
        .isEmail()
        .withMessage('email must contain a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long'),
    body('username').
        exists({ checkFalsy: true })

];

const createTokenValidator = [
    body('email')
        .isEmail()
        .withMessage('email must contain a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long')
];



const updateUserValidator = [
    body('userid')
        .isNumeric(),
    body('username')
        .isString()
        .isLength({ min: 4 })
        .withMessage('password must be at least 8 characters long and string'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long')
];


const updateActiveUserValidator = [
    body('userid')
        .isNumeric(),
    body('active')
        .isBoolean()
]

const updatePermissionValidator = [
    body('userid')
        .isNumeric(),
    body('permission')
        .isString()
];



module.exports = {
    createUserValidator,
    createTokenValidator,
    updatePermissionValidator,
    updateUserValidator,
    updateActiveUserValidator
}