import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import GroupMessage from './model/Groupmessagemodel';
import { register, login, chathistory } from './controller/usercontroller';
import { createGroup, addGroupMember, groupRemoveMember, deleteGroup } from './controller/groupcontroller';
import { authenticate } from './midleware/auth';
import GroupUser from './model/groupusermodel';
import bcrypt from 'bcrypt';
import Group from './model/groupmodel';
import GroupMember from './model/groupmembermodel';
import User from './model/usermodel';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// user register
app.get('/register', (req, res) => {
  res.render('register');
});
app.post("/register", register);

// user login
app.get("/user_login", (req, res) => {
  res.render("user_login")
})
app.post("/login", login);


// user show chat history
app.get("/chathistory", (req, res) => {
  res.render("chathistory")
})
app.get("/chat_history", chathistory)


app.get("/chat_history", authenticate,  chathistory)


// Server login page
app.get('/', (req, res) => {
  res.render('login');
});


// Server create group page
app.get('/creategroup.ejs', (req, res) => {
  res.render('creategroup');
});
app.post('/api/groups',createGroup);

// Serve chat page
app.get('/index.ejs', (req, res) => {
  const groupId = req.query.groupId;
  res.render('index', { groupId: groupId });
});

// Group
app.post("/groups/:groupId/members/:userId", authenticate, addGroupMember);
app.delete("/groups/:groupId/members/:userId", authenticate, groupRemoveMember);
app.delete("/groups/:groupId", authenticate, deleteGroup);


// Handle new socket connections
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

const PORT = process.env.PORT || 8002;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});