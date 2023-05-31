import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';


class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  public static associate(models: any) {
    User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
    User.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
  }
}

User.init(
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    sequelize,
    timestamps: false,
  }
);

export default User;
