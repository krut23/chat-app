"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const uuid_1 = require("uuid");
class Group extends sequelize_1.Model {
    static associate(models) {
        Group.hasMany(models.GroupMessage, { foreignKey: 'groupId', as: 'messages' });
        Group.hasMany(models.GroupMember, { foreignKey: 'groupId', as: 'members' });
        Group.belongsToMany(models.User, { through: models.GroupMember, foreignKey: 'groupId', as: 'users' });
    }
}
Group.init({
    groupId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, uuid_1.v4)(),
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'group',
    modelName: 'Group',
    paranoid: false
});
exports.default = Group;
