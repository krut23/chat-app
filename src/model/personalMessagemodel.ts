import { DataTypes, Model } from 'sequelize';
import sequelize from '../database'; 

class PersonalMessage extends Model {
  
  public id!: number;
  public sender!: string;
  public receiver!: string;
  public content!: string;
}

PersonalMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'PersonalMessage',
    tableName: 'personal_messages'
  }
);

export default PersonalMessage;
