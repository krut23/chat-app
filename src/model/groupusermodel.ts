import { BelongsToMany, DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';
import GroupMessage from './Groupmessagemodel';


export class GroupUser extends Model {
  public id!: number;
  public username!: string;
  public email!:string;
  
 
  public readonly groups?: Group[];
  public static associate(models: any) {
    GroupUser.belongsToMany(models.Group, { through: 'GroupMember', foreignKey: 'userId' });
  }

}

GroupUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'Group_users',
  }
);


export default GroupUser;
