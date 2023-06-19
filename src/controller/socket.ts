import { Server } from 'socket.io';
import GroupMessage from '../model/Groupmessagemodel';
import PersonalMessage from '../model/personalMessagemodel';
import Group from '../model/groupmodel';
import User from '../model/usermodel';
import bcrypt from 'bcrypt';
import { Server as HttpServer } from 'http';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import crypto from 'crypto';
import redisClient from './redisClient';


dotenv.config({ path: './config.env' });

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer);


  io.on('connection', (socket) => {
    console.log('A user connected.');

    // Handle login event
    socket.on('login', async (data) => {
      try {
        const { username, password } = data;
        const user = await User.findOne({ where: { username } });
        if (!user) {
          socket.emit('loginError', { message: 'Invalid username or password' });
          return;
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          socket.emit('loginError', { message: 'Invalid username or password' });
          return;
        }
        const apiKey = crypto.randomBytes(32).toString('hex');
        // Successful login
        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN!, { expiresIn: '10h' });

        // Store the token, API key, and user ID in Redis
        const redisKey = `${user.id}`;
        const redisValue = JSON.stringify({ token, apiKey });
        redisClient.set(redisKey, redisValue, 'EX', 10 * 60 * 60); // Set expiration time to 10 hours

        socket.emit('loginSuccess', { message: 'Login successful', token });

      } catch (error) {
        console.error(error);
        socket.emit('loginError', { message: 'Internal server error' });
      }
    });

    // Send the list of active groups
    Group.findAll().then((groups) => {
      socket.emit('groups', groups);
    });


    // Handle new user joining
    socket.on('joinChat', async (groupId, username) => {
      try {
        // Join the room 
        socket.join(`group_${groupId}`);
        // Fetch the group name from the database
        const group = await Group.findByPk(groupId);

        if (group) {
          socket.emit('groupName', group.name);

          const message = `${username} joined the chat`;
          io.to(`group_${groupId}`).emit('userJoined', message);

          // Fetch previous messages from the group
          const previousMessages = await GroupMessage.findAll({
            where: { groupId },
            order: [['createdAt', 'ASC']],
          });
          socket.emit('previousMessages', previousMessages);
        } else {
          console.error('Group not found');
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });


    // Listen for new messages
    socket.on('message', async (message) => {
      console.log('Received message:', message);
      try {
        // Save the message to the database
        const savedMessage = await GroupMessage.create({
          content: message.content,
          groupId: message.groupId,
          username: message.username,
        });
        console.log('Message saved:', savedMessage);

        // Emit the message to the group room
        io.to(`group_${message.groupId}`).emit('message', savedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });


    // Handle personal chat messages
    socket.on('personalchat message', async (data) => {
      try {
        const { message, sender, receiver } = data;
        const newMessage = new PersonalMessage({
          content: message,
          sender,
          receiver,
        });
        await newMessage.save();
        io.emit('personalchat message', newMessage);
      } catch (error) {
        console.error('Error saving message:', (error as Error).message);
      }
    });

    // Handle request for previous messages
    socket.on('previous personalchat messages', async (data, callback) => {
      try {
        const { sender, receiver } = data;

        const previousMessages = await PersonalMessage.findAll({
          where: {
            [Op.or]: [
              { sender: sender, receiver: receiver },
              { sender: receiver, receiver: sender },
            ],
          },
          order: [['createdAt', 'ASC']],
        });

        callback(previousMessages);
      } catch (error) {
        console.error('Error retrieving previous messages:', (error as Error).message);
        callback([]);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected.');
    });
  });
  return io;
}