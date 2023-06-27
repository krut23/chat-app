"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class User extends sequelize_1.Model {
    static associate(models) {
        User.hasMany(models.PersonalMessage, { foreignKey: 'senderId', as: 'sentMessages' });
        User.hasMany(models.PersonalMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
        User.belongsToMany(models.Group, { through: models.GroupMember, foreignKey: 'userId', as: 'groups' });
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: database_1.default,
    tableName: 'users',
    modelName: 'User',
});
exports.default = User;
