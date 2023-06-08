import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';


dotenv.config({ path: './config.env' });

const sequelize = new Sequelize(
  `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  { dialect: 'postgres', logging: false }
);


sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });


export default sequelize;
