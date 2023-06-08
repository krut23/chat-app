import express from 'express';
import { createServer } from 'http';
import { register, login, chathistory } from './controller/usercontroller';
import { createGroup, addGroupMember, groupRemoveMember, deleteGroup } from './controller/groupcontroller';
import { authenticate } from './midleware/auth';
import { initializeSocket } from './controller/socket';
import User from './model/usermodel';


const app = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);


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
  res.render("user_login");
})
app.post("/login", login);


// user show chat history
app.get("/chathistory", (req, res) => {
  res.render("chathistory")
})
app.get("/chat_history",authenticate,  chathistory)


// Server login page
app.get('/', (req, res) => {
  res.render('login');
});


// Server create group page
app.get('/creategroup.ejs', (req, res) => {
  res.render('creategroup');
});
app.post('/api/groups',createGroup);


// Server group chat page
app.get('/index.ejs', (req, res) => {
  const groupId = req.query.groupId;
  res.render('index', { groupId: groupId });
});


  // Server personal chat page
  app.get('/personalchat.ejs', async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['username'], 
        raw: true, 
      });
      res.render('personalchat', { users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
    }
  });

// Group
app.post("/groups/:groupId/members/:userId", authenticate, addGroupMember);
app.delete("/groups/:groupId/members/:userId", authenticate, groupRemoveMember);
app.delete("/groups/:groupId", authenticate, deleteGroup);



const PORT = process.env.PORT || 7001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});