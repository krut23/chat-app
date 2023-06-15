import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from './usermodel';

class GroupMessage extends Model {
  public id!: number;
  public content!: string;
  public groupId!: number;
  public username!: string;

  public static associate(models: any) {
    GroupMessage.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
    GroupMessage.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
  }
}

GroupMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'group_message',
    modelName: 'GroupMessage',
  }
);

export default GroupMessage;