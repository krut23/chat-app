import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import User from './usermodel';

class GroupMember extends Model {
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
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: Group,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
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
