import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'

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
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Authorization header missing' });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN!);
        req.user = decodedToken;
    
        next();
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid token' });
      }
    };
  

export default { authenticate}