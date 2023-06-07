import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import User from './usermodel'

class GroupMember extends Model {
  public id!:number;
  public groupId!: number;
  public userId!: number;
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
    tableName: 'group_members',
    sequelize,
    timestamps: false,
  }
);

export default GroupMember;
