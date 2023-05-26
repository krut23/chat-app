import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from './usermodel';
import GroupMember from './groupmembermodel';

class Group extends Model {
  public id!: number;
  public name!: string;
  public adminId!: number;

  public static associate(models: any) {
    Group.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
    Group.hasMany(models.GroupMember, { foreignKey: 'groupId', as: 'members' });
  }
  // Check if a user is the admin of the group
  public isAdmin(userId: number): boolean {
    return this.adminId === userId;
  }
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'groups',
    sequelize,
    timestamps: false,
  }
);
export default Group;
