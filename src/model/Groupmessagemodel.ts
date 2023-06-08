import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import User from './usermodel';

class GroupMessage extends Model {
  id!: number;
  content!: string;
  groupId!: number;
  username!:string 

  static associate(models: any) {
    GroupMessage.belongsTo(models.Group, { foreignKey: 'groupId' });
    GroupMessage.belongsTo(models.User, { foreignKey: 'senderId' });
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

GroupMessage.sync({ alter: true })
  .then(() => {
    console.log('Group-mesage model created successfully.');
  })
  .catch((error) => {
    console.error('Error creating Group-message model:', error);
  });
  
export default GroupMessage;
