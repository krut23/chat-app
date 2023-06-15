import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/usermodel'
import GroupMessage from '../model/Groupmessagemodel';
import  sequelize  from '../database';

dotenv.config({ path: './config.env' });

export const register = async (req: Request, res: Response) => {
  let transaction;
  try {
    transaction = await sequelize.transaction(); // Start a new transaction

    const { username, email, password } = req.body;

    const userExists = await User.findOne({ where: { email }, transaction });
    if (userExists) {
      await transaction.rollback(); // Rollback the transaction
      return res.status(400).json({ message: 'Email ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        username,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit(); // Commit the transaction

    res.redirect('/');
  } catch (error) {
    console.error(error);
    if (transaction) {
      await transaction.rollback(); // Rollback the transaction
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const login = async (req: Request, res: Response) => {
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

    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN!, { expiresIn: '10h' });

    res.redirect(`/chat_history?token=${token}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const chathistory = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;

    const transaction = await sequelize.transaction(); // Start a new transaction

    try {
      // Fetch the chat history for the user
      const chatHistory = await GroupMessage.findAndCountAll({
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize,
        transaction,
      });

      await transaction.commit(); // Commit the transaction

      res.render('chat_history', {
        chatHistory: chatHistory.rows,
        totalPages: Math.ceil(chatHistory.count / pageSize),
        currentPage: pageNumber,
      });
    } catch (error) {
      console.error(error);
      await transaction.rollback(); // Rollback the transaction
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { register, login, chathistory };
