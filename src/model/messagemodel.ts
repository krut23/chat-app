import { Model, DataTypes } from 'sequelize';
import  sequelize  from '../database';

class Message extends Model {
  public id!: number;
  public content!: string;
  public senderId!: string;
  public receiverId?: string;
  public groupId?: string;

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
  }
);

export default Message;
