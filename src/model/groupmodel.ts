import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { v4 as uuidv4 } from 'uuid';
import GroupMember from './groupmembermodel';

class Group extends Model {
  public groupId!: string;
  public name!: string;
  id: any;

  public static associate(models: any) {
    Group.hasMany(models.GroupMessage, { foreignKey: 'groupId', as: 'messages' });
    Group.hasMany(models.GroupMember, { foreignKey: 'groupId', as: 'members' });
    Group.belongsToMany(models.User, { through: models.GroupMember, foreignKey: 'groupId', as: 'users' });
  }
}

Group.init(
  {
    groupId: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'group',
    modelName: 'Group',
    paranoid: false
  }
);

export default Group;