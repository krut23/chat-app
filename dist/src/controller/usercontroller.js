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
exports.chathistory = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const usermodel_1 = __importDefault(require("../model/usermodel"));
const Groupmessagemodel_1 = __importDefault(require("../model/Groupmessagemodel"));
const database_1 = __importDefault(require("../database"));
const redisClient_1 = __importDefault(require("./redisClient"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config({ path: './config.env' });
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction;
    try {
        transaction = yield database_1.default.transaction(); // Start a new transaction
        const { username, email, password } = req.body;
        const userExists = yield usermodel_1.default.findOne({ where: { email }, transaction });
        if (userExists) {
            yield transaction.rollback(); // Rollback the transaction
            return res.status(400).json({ message: 'Email ID already registered' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield usermodel_1.default.create({
            username,
            email,
            password: hashedPassword,
        }, { transaction });
        yield transaction.commit(); // Commit the transaction
        res.redirect('/');
    }
    catch (error) {
        console.error(error);
        if (transaction) {
            yield transaction.rollback(); // Rollback the transaction
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield usermodel_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const apiKey = crypto_1.default.randomBytes(32).toString('hex');
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.ACCESS_TOKEN, { expiresIn: '10h' });
        // Store the token, API key, and user ID in Redis
        const redisKey = `${user.id}`;
        const redisValue = JSON.stringify({ token, apiKey });
        redisClient_1.default.set(redisKey, redisValue, 'EX', 10 * 60 * 60); // Set expiration time to 10 hours
        res.redirect(`/chat_history?token=${token}`);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const chathistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        // Fetch the chat history for the user
        const chatHistory = yield Groupmessagemodel_1.default.findAndCountAll({
            offset: (pageNumber - 1) * pageSize,
            limit: pageSize,
        });
        res.render('chat_history', {
            chatHistory: chatHistory.rows,
            totalPages: Math.ceil(chatHistory.count / pageSize),
            currentPage: pageNumber,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chathistory = chathistory;
exports.default = { register: exports.register, login: exports.login, chathistory: exports.chathistory };
