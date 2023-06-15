  import { Model, DataTypes } from 'sequelize';
  import sequelize from '../database';
  import bcrypt from 'bcrypt';

  class User extends Model {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    

    public static associate(models: any) {
      User.hasMany(models.PersonalMessage, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.PersonalMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
      User.belongsToMany(models.Group, { through: models.GroupMember, foreignKey: 'userId', as: 'groups' });
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
        unique: true,
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
      sequelize,
      tableName: 'users',
      modelName: 'User',
    }
  );

  export default User;
