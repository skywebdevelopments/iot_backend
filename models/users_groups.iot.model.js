const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const { userModel } = require('./user.iot.model')
const { usergroupModel } = require('./usergroup.iot.model')

const users_groups = sequelize.define('users_groups', {}, { timestamps: false });

userModel.belongsToMany(usergroupModel, { through: users_groups });
usergroupModel.belongsToMany(userModel, { through: users_groups });

exports.users_groupsModel = users_groups;