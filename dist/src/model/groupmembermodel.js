"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
const usermodel_1 = __importDefault(require("./usermodel"));
class GroupMember extends sequelize_1.Model {
    static associate(models) {
        GroupMember.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
        GroupMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
}
GroupMember.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    groupId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: usermodel_1.default,
            key: 'id',
        },
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'group_member',
    modelName: 'GroupMember',
    paranoid: false,
});
exports.default = GroupMember;
