import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import Message from './model/messagemodel';
import { register, login,chathistory } from './controller/usercontroller';
import { authenticate } from './midleware/auth';
import path from 'path'


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.get("/",(req,res)=>{
res.render("index")
})

app.get('/register', (req,res) => {
  res.render('register');
});
app.post("/register", register);

app.get("/login", (req,res)=>{
  res.render("login")
})

app.post("/login",login);

app.get("/chathistory",(req,res)=>{
  res.render("chathistory")
})
app.get("/chat_history",authenticate,chathistory)

// Socket.io 
io.on('connection', (socket: Socket) => {
  console.log('Connected');

  
  // group chat
  socket.on('joinGroup', (groupId: string) => {
    socket.join(groupId);
    console.log(`User joined group ${groupId}`);
  });

  socket.on('leaveGroup', (groupId: string) => {
    socket.leave(groupId);
    console.log(`User left group ${groupId}`);
  });

  socket.on('groupChatMessage', async (messageData: any) => {
    try {
      // Save message 
      const { content, groupId } = messageData;
      const message = await Message.create({ content, senderId: socket.id, groupId });

      io.to(groupId).emit('groupChatMessage', { content, senderId: socket.id });
    } catch (error) {
      console.error('Error saving group chat message:', error);
    }
  });

  // one to one chat
  socket.on('ChatMessage', async (messageData: any) => {
    try {
      // Save message 
      const { content, senderId, receiverId } = messageData;
      const message = await Message.create({ content, senderId, receiverId });

      socket.emit('ChatMessage', message);

      const receiverSocket = io.sockets.sockets.get(receiverId);
      if (receiverSocket) {
        receiverSocket.emit('ChatMessage', message);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
