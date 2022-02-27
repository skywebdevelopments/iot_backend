const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const { userModel } = require('./user.iot.model')
const { u_groupModel } = require('./u_group.iot.model')

const users_groups = sequelize.define('users_groups', {}, { timestamps: false });

userModel.belongsToMany(u_groupModel, { through: 'users_groups', as: 'u_group', onDelete: 'cascade' });
u_groupModel.belongsToMany(userModel, { through: 'users_groups', as: 'user', onDelete: 'cascade' });

exports.users_groupsModel = users_groups;