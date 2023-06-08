import { DataTypes, Model, Sequelize, UUIDV4} from 'sequelize';
import sequelize from '../database';
import { v4 as uuidv4 } from 'uuid';
import GroupMessage from './Groupmessagemodel';

class Group extends Model {
  static associate(arg0: { GroupMessage: typeof GroupMessage; GroupMember: typeof import("./groupmembermodel").default; }) {
    throw new Error('Method not implemented.');
  }
  groupId!: number;
  name!: string;
  username!: string;
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
    tableName: 'group',
    modelName: 'Group',
  }
);

Group.sync({ alter: true })
  .then(() => {
    console.log('Group model created successfully.');
  })
  .catch((error) => {
    console.error('Error creating Group model:', error);
  });

export default Group;
