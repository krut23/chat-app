import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import '../database';
import User from '../model/usermodel';
import dotenv from 'dotenv'
import Message from '../model/messagemodel';
import ejs from 'ejs';

dotenv.config({ path: './config.env' });



export const register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
    
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'email id already register' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      res.redirect('/login');
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  export const login = async (req: Request, res: Response) =>{
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id}, process.env.ACCESS_TOKEN!, {expiresIn: '10h'});

      res.redirect(`/chat_history?token=${token}`);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
 
  export const chathistory = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      const { page, limit } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = parseInt(limit as string) || 10;
  
      const offset = (pageNumber - 1) * pageSize;
      const message = await Message.findByPk(groupId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      const chatHistory = await Message.findAndCountAll({
        offset,
        limit: pageSize,
      });
  
      res.render('chathistory', {
        chatHistory: chatHistory.rows,
        totalPages: Math.ceil(chatHistory.count / pageSize),
        currentPage: pageNumber,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  

export default { register,login,chathistory};
