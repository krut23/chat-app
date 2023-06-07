import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import User from './usermodel';

class GroupMessage extends Model {
  id!: number;
  content!: string;
  groupId!: number;
  username!:string // Add the groupId column

  static associate() {
    GroupMessage.belongsTo(Group, { foreignKey: 'groupId' });
    GroupMessage.belongsTo(User, { foreignKey: 'userId' });
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
    modelName: 'Group-Message',
  }
);

export default GroupMessage;
