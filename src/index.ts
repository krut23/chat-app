import express from 'express';
import { createServer } from 'http';
import { register, login, chathistory } from './controller/usercontroller';
import { createGroup, addGroupMember, groupRemoveMember, deleteGroup } from './controller/groupcontroller';
import { authenticate } from './midleware/auth';
import { initializeSocket } from './controller/socket';
import User from './model/usermodel';
import sequelize from './database';


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
  const token = req.query.token;
  res.render('creategroup',{token});
});
app.post('/creategroups',authenticate, createGroup);


// Server group chat page
app.get('/index.ejs', (req, res) => {
  const groupId = req.query.groupId;
  res.render('index', { groupId: groupId });
});


  // Server personal chat page
app.get('/personalchat.ejs', async (req, res) => {
  const scopeName = 'personalchats';
  const existingScopes: string[] = [];

  const scopeExists = existingScopes.includes(scopeName);

  if (!scopeExists) {
    User.addScope(scopeName, (options) => {
      return {
        attributes: ['username'],
        raw: true,
        override: true,
      };
    });

    existingScopes.push(scopeName);
  }

  try {
    const users = await User.scope(scopeName).findAll({});
    res.render('personalchat', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Group
app.post("/groups/:groupId", authenticate, addGroupMember);
app.delete("/groups/:groupId/remove", authenticate, groupRemoveMember);
app.delete("/groups/:groupId", authenticate, deleteGroup);



// Synchronize models with the database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((err) => {
    console.error('Error synchronizing models:', err);
  });
  

const PORT = process.env.PORT || 7001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});