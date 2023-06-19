import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'
import redisClient from '../controller/redisClient';

dotenv.config({ path: './config.env' });

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


// Middleware to authenticate  user
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token?.toString();
  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN!) as { id: number };
    req.user = decoded;

    // Check if the token, API key, and user ID are present in Redis
    const redisKey = `${decoded.id}`;
    redisClient.get(redisKey, (error, redisValue) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!redisValue) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      const { token: redisToken, apiKey } = JSON.parse(redisValue);
      if (redisToken !== token) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = { id: decoded.id, apiKey };
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}


export default { authenticate }