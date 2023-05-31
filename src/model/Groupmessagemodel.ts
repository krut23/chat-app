import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Group from './groupmodel';

class GroupMessage extends Model {
  public id!: number;
  public content!: string;
  public sender!: string;

}

GroupMessage.init(
  {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Group_Message',
  }
);

export default GroupMessage;
