import { DataTypes, Model } from 'sequelize';
import sequelize from '../database'; 

class PersonalMessage extends Model {
  static associate(arg0: { User: typeof import("./usermodel").default; }) {
    throw new Error('Method not implemented.');
  }
  static find(arg0: { $or: { sender: any; receiver: any; }[]; }) {
    throw new Error('Method not implemented.');
  }
  
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

PersonalMessage.sync({ alter: true })
  .then(() => {
    console.log('Personal-Message model created successfully.');
  })
  .catch((error) => {
    console.error('Error creating Personal-message model:', error);
  });
  
export default PersonalMessage;
