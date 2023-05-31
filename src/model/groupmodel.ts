import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from './usermodel';
import GroupMember from './groupmembermodel';
import GroupUser from './groupusermodel';

class Group extends Model {
  public id!: number;
  public name!: string;
  public adminId!: number;

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
        references: {
          model: GroupUser,
          key: 'id',
        },
      },
  },
  {
    tableName: 'groups',
    sequelize,
    timestamps: false,
  }
);

Group.belongsTo(GroupUser, {
  foreignKey: 'adminId',
  as: 'admin',
});

Group.hasMany(GroupMember, {
  foreignKey: 'groupId',
  as: 'members',
});
export default Group;
