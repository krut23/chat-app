"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisOptions = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
};
const redisClient = new ioredis_1.default(redisOptions);
redisClient.on("connect", () => {
    console.log("Redis Connected");
});
redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
});
exports.default = redisClient;
