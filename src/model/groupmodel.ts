import { DataTypes, Model, Sequelize, UUIDV4} from 'sequelize';
import sequelize from '../database';
import { v4 as uuidv4 } from 'uuid';
import GroupMessage from './Groupmessagemodel';

class Group extends Model {
  groupId!: number;
  name!: string;
  username!: string;
  id: any;
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
    username: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Group',
  }
);

export default Group;
