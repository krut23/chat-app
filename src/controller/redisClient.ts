import Redis, { RedisOptions } from 'ioredis'
import dotenv from 'dotenv';
dotenv.config();


const redisOptions:RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
}

const redisClient = new Redis(redisOptions);

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
  });
export default redisClient;