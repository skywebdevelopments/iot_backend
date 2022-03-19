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

const createUgroupValidator = [
    body('groupname')
        .isString(),
    body('roles')
        .isArray(),
    body('active')
        .isBoolean()
];

const createRoleValidator = [
    body('role').isString(),
];

const updateUgroupValidator = [
    body('groupname')
        .isString(),
    body('roles')
        .isArray(),
    body('active')
        .isBoolean(),
    body('rec_id')
        .exists({ checkFalsy: true })
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
    body('id')
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
    body('id')
        .isNumeric(),
    body('active')
        .isBoolean()
]

const updatePermissionValidator = [
    body('id')
        .isNumeric(),
    body('groupname')
        .isString()
];

const getUserValidator =[
    body('id')
        .isNumeric()
];


module.exports = {
    createUserValidator,
    createTokenValidator,
    updatePermissionValidator,
    updateUserValidator,
    updateActiveUserValidator,
    createUgroupValidator,
    updateUgroupValidator,
    getUserValidator,
    createRoleValidator
}