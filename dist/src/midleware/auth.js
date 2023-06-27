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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const redisClient_1 = __importDefault(require("../controller/redisClient"));
dotenv_1.default.config({ path: './config.env' });
// Middleware to authenticate  user
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || ((_b = req.query.token) === null || _b === void 0 ? void 0 : _b.toString());
    if (!token) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded;
        // Check if the token, API key, and user ID are present in Redis
        const redisKey = `${decoded.id}`;
        redisClient_1.default.get(redisKey, (error, redisValue) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!redisValue) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            const { token: redisToken, apiKey } = JSON.parse(redisValue);
            if (redisToken !== token) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = { id: decoded.id, apiKey };
            next();
        });
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.authenticate = authenticate;
exports.default = { authenticate: exports.authenticate };
