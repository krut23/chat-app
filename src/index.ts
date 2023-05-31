import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import GroupMessage from './model/Groupmessagemodel';
import { register, login,chathistory } from './controller/usercontroller';
import { addGroupMember,groupRemoveMember,deleteGroup } from './controller/groupcontroller';
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
app.get('/register', (req,res) => {
  res.render('register');
});
app.post("/register", register);

// user login
app.get("/user_login", (req,res)=>{
  res.render("user_login")
})
app.post("/login",login);

// user show chat history
app.get("/chathistory",(req,res)=>{
  res.render("chathistory")
})
app.get("/chat_history",chathistory)


// Server login page
app.get('/', (req, res) => {
  res.render('login');
});

// Server create group page
app.get('/creategroup.ejs', (req, res) => {
  res.render('creategroup');
});

// Server group chat page
app.get('/index.ejs', (req, res) => {
  res.render('index')
});

// Group
app.post("/groups/:groupId/members/:userId", authenticate,addGroupMember);
app.delete("/groups/:groupId/members/:userId", authenticate, groupRemoveMember);
app.delete("/groups/:groupId", authenticate,deleteGroup);

const users: { [key: string]: string } = {};

// Handle new socket connections
io.on('connection', (socket: Socket) => {
  console.log('A user connected.');
 
// Handle login event
socket.on('login', async (data: { username: string; password: string }) => {
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

     // Save the database
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


// Handle create group event
socket.on('createGroup', async ({ name, adminId }) => {
  try {
    // Create the group in the database
    const group = await Group.create({ name, adminId });
    // Create the group member entry in the database
    await GroupMember.create({ groupId: group.id, userId: adminId, isAdmin: true });

    socket.emit('groupCreated', group.toJSON());
  } catch (error) {
    console.error('Error creating group:', error);
    socket.emit('groupCreationError', { error: 'Failed to create group' });
  }
});


  // Handle joining a group
  socket.on('new-user-joined', name => {
    console.log("New user",name)
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
    
  });
  socket.on('send', (message) => {
    socket.broadcast.emit('receive', {
      message: message,
      name: users[socket.id],
    });
    // Save the group message to the database
    GroupMessage.create({
      content: message,
      sender: users[socket.id],
    });
  });
  
   

  socket.on('disconnet', message => {
    socket.broadcast.emit('left',users[socket.id]);
    delete users[socket.id];
  });
});


const PORT = process.env.PORT || 8001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
