"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const usercontroller_1 = require("./controller/usercontroller");
const groupcontroller_1 = require("./controller/groupcontroller");
const auth_1 = require("./midleware/auth");
const socket_1 = require("./controller/socket");
const usermodel_1 = __importDefault(require("./model/usermodel"));
const database_1 = __importDefault(require("./database"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = (0, socket_1.initializeSocket)(httpServer);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// user register
app.get('/register', (req, res) => {
    res.render('register');
});
app.post("/register", usercontroller_1.register);
// user login
app.get("/user_login", (req, res) => {
    res.render("user_login");
});
app.post("/login", usercontroller_1.login);
// user show chat history
app.get("/chathistory", (req, res) => {
    res.render("chathistory");
});
app.get("/chat_history", auth_1.authenticate, usercontroller_1.chathistory);
// Server login page
app.get('/', (req, res) => {
    res.render('login');
});
// Server create group page
app.get('/creategroup.ejs', (req, res) => {
    const token = req.query.token;
    res.render('creategroup', { token });
});
app.post('/creategroups', auth_1.authenticate, groupcontroller_1.createGroup);
// Server group chat page
app.get('/index.ejs', (req, res) => {
    const groupId = req.query.groupId;
    res.render('index', { groupId: groupId });
});
// Server personal chat page
app.get('/personalchat.ejs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scopeName = 'personalchats';
    const existingScopes = [];
    const scopeExists = existingScopes.includes(scopeName);
    if (!scopeExists) {
        usermodel_1.default.addScope(scopeName, (options) => {
            return {
                attributes: ['username'],
                raw: true,
                override: true,
            };
        });
        existingScopes.push(scopeName);
    }
    try {
        const users = yield usermodel_1.default.scope(scopeName).findAll({});
        res.render('personalchat', { users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
}));
// Group
app.post("/groups/:groupId", auth_1.authenticate, groupcontroller_1.addGroupMember);
app.delete("/groups/:groupId/remove", auth_1.authenticate, groupcontroller_1.groupRemoveMember);
app.delete("/groups/:groupId", auth_1.authenticate, groupcontroller_1.deleteGroup);
// Synchronize models with the database
database_1.default
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
