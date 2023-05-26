import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const sequelize = new Sequelize(
  `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  { dialect: 'postgres', logging: false }
);


(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database');
    await sequelize.sync({ force: true });
    console.log('Models synchronized with the database');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;
