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
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const Groupmessagemodel_1 = __importDefault(require("../model/Groupmessagemodel"));
const personalMessagemodel_1 = __importDefault(require("../model/personalMessagemodel"));
const groupmodel_1 = __importDefault(require("../model/groupmodel"));
const usermodel_1 = __importDefault(require("../model/usermodel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const redisClient_1 = __importDefault(require("./redisClient"));
dotenv_1.default.config({ path: './config.env' });
function initializeSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer);
    io.on('connection', (socket) => {
        console.log('A user connected.');
        // Handle login event
        socket.on('login', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = data;
                const user = yield usermodel_1.default.findOne({ where: { username } });
                if (!user) {
                    socket.emit('loginError', { message: 'Invalid username or password' });
                    return;
                }
                const match = yield bcrypt_1.default.compare(password, user.password);
                if (!match) {
                    socket.emit('loginError', { message: 'Invalid username or password' });
                    return;
                }
                const apiKey = crypto_1.default.randomBytes(32).toString('hex');
                // Successful login
                const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.ACCESS_TOKEN, { expiresIn: '10h' });
                // Store the token, API key, and user ID in Redis
                const redisKey = `${user.id}`;
                const redisValue = JSON.stringify({ token, apiKey });
                redisClient_1.default.set(redisKey, redisValue, 'EX', 10 * 60 * 60); // Set expiration time to 10 hours
                socket.emit('loginSuccess', { message: 'Login successful', token });
            }
            catch (error) {
                console.error(error);
                socket.emit('loginError', { message: 'Internal server error' });
            }
        }));
        // Send the list of active groups
        groupmodel_1.default.findAll().then((groups) => {
            socket.emit('groups', groups);
        });
        // Handle new user joining
        socket.on('joinChat', (groupId, username) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Join the room 
                socket.join(`group_${groupId}`);
                // Fetch the group name from the database
                const group = yield groupmodel_1.default.findByPk(groupId);
                if (group) {
                    socket.emit('groupName', group.name);
                    const message = `${username} joined the chat`;
                    io.to(`group_${groupId}`).emit('userJoined', message);
                    // Fetch previous messages from the group
                    const previousMessages = yield Groupmessagemodel_1.default.findAll({
                        where: { groupId },
                        order: [['createdAt', 'ASC']],
                    });
                    socket.emit('previousMessages', previousMessages);
                }
                else {
                    console.error('Group not found');
                }
            }
            catch (error) {
                console.error('Error joining chat:', error);
            }
        }));
        // Listen for new messages
        socket.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received message:', message);
            try {
                // Save the message to the database
                const savedMessage = yield Groupmessagemodel_1.default.create({
                    content: message.content,
                    groupId: message.groupId,
                    username: message.username,
                });
                console.log('Message saved:', savedMessage);
                // Emit the message to the group room
                io.to(`group_${message.groupId}`).emit('message', savedMessage);
            }
            catch (error) {
                console.error('Error saving message:', error);
            }
        }));
        // Handle personal chat messages
        socket.on('personalchat message', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { message, sender, receiver } = data;
                const newMessage = new personalMessagemodel_1.default({
                    content: message,
                    sender,
                    receiver,
                });
                yield newMessage.save();
                io.emit('personalchat message', newMessage);
            }
            catch (error) {
                console.error('Error saving message:', error.message);
            }
        }));
        // Handle request for previous messages
        socket.on('previous personalchat messages', (data, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sender, receiver } = data;
                const previousMessages = yield personalMessagemodel_1.default.findAll({
                    where: {
                        [sequelize_1.Op.or]: [
                            { sender: sender, receiver: receiver },
                            { sender: receiver, receiver: sender },
                        ],
                    },
                    order: [['createdAt', 'ASC']],
                });
                callback(previousMessages);
            }
            catch (error) {
                console.error('Error retrieving previous messages:', error.message);
                callback([]);
            }
        }));
        socket.on('disconnect', () => {
            console.log('A user disconnected.');
        });
    });
    return io;
}
exports.initializeSocket = initializeSocket;
