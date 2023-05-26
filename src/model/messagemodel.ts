import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from './usermodel';
import Group from './groupmodel';

class Message extends Model {
  public id!: number;
  public content!: string;
  public senderId!: string;
  public receiverId?: string;
  public groupId?: string;

  public static associate(models: any) {
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
    Message.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
  }
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'messages',
    sequelize,
    timestamps: false,
  }
);

export default Message;
