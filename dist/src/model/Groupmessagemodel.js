"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class GroupMessage extends sequelize_1.Model {
    static associate(models) {
        GroupMessage.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
        GroupMessage.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    }
}
GroupMessage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    groupId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'group_message',
    modelName: 'GroupMessage',
});
exports.default = GroupMessage;
