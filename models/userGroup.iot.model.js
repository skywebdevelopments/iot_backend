const sequelize = require('../database/connection');
const { Sequelize, DataTypes } = require('sequelize');

const { userModel } = require('./user.iot.model')
const { u_groupModel } = require('./u_group.iot.model')

const user_group = sequelize.define('user_group', {}, {  tableName: 'user_group', timestamps: false });

//userModel.belongsToMany(u_groupModel, { through: 'user_group', as: 'u_group', onDelete: 'cascade' });
//u_groupModel.belongsToMany(userModel, { through: 'user_group', as: 'user_iot', onDelete: 'cascade' });

u_groupModel.belongsToMany(userModel, {through: user_group,as: 'users',});
userModel.belongsToMany(u_groupModel, {through: user_group,as: 'u_groups',});

exports.user_groupModel = user_group;