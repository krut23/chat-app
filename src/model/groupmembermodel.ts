import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import GroupUser from './groupusermodel';

class GroupMember extends Model {
  public id!:number;
  public groupId!: number;
  public userId!: number;
  public isAdmin!: boolean;

  public static associate(models: any) {
    GroupMember.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
    GroupMember.belongsTo(models.GroupUser, { foreignKey: 'userId', as: 'user' });
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
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: GroupUser,
        key: 'id',
      },
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
