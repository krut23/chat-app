"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class PersonalMessage extends sequelize_1.Model {
    static associate(models) {
        PersonalMessage.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
        PersonalMessage.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
    }
}
PersonalMessage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    receiver: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: 'PersonalMessage',
    tableName: 'personal_messages',
});
exports.default = PersonalMessage;
