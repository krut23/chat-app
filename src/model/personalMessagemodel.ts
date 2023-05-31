import {DataTypes, Model} from 'sequelize';
import sequelize from "../database";

class PersonlMessage extends Model {

}

PersonlMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'Personl_Message' 
  }
);
export default PersonlMessage;
