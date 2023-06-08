import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import User from './usermodel'

class GroupMember extends Model {
  public id!:number;
  public groupId!: number;
  public username!: string;
  public isAdmin!: boolean;

  public static associate(models: any) {
    GroupMember.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
    GroupMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

GroupMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupId: {
      type: DataTypes.UUID, 
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'group_member',
    modelName: 'Group',
  }
);

GroupMember.sync({ alter: true })
  .then(() => {
    console.log('Group-member model created successfully.');
  })
  .catch((error) => {
    console.error('Error creating Group member model:', error);
  });
  
export default GroupMember;
