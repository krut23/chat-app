import { Server } from 'socket.io';
import GroupMessage from '../model/Groupmessagemodel';
import PersonalMessage from '../model/personalMessagemodel';
import Group from '../model/groupmodel';
import User from '../model/usermodel';
import GroupUser from '../model/groupusermodel';
import bcrypt from 'bcrypt';
import { Server as HttpServer } from 'http';

export function initializeSocket(httpServer:HttpServer) {
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
        // Successful login
        socket.emit('loginSuccess', { message: 'Login successful' });
  
        // Save the user details in the GroupUser model
        const groupUser = new GroupUser({
          username: user.username,
          email: user.email,
        });
        await groupUser.save();
      } catch (error) {
        console.error(error);
        socket.emit('loginError', { message: 'Internal server error' });
      }
    });
  
       // Send the list of active groups
       Group.findAll().then((groups) => {
        socket.emit('groups', groups);
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
          io.emit('message', savedMessage);
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
        console.error('Error saving message:', error);
      }
    });
  
  
      // Join a group
      socket.on('joinGroup', (groupId) => {
        if (groupId) { 
          socket.join(groupId);
        }
      });
    
    socket.on('disconnect', () => {
      console.log('A user disconnected.');
    });
  });
  return io;
}