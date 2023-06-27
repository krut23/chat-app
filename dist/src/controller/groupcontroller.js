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
exports.deleteGroup = exports.groupRemoveMember = exports.addGroupMember = exports.createGroup = void 0;
const groupmodel_1 = __importDefault(require("../model/groupmodel"));
const groupmembermodel_1 = __importDefault(require("../model/groupmembermodel"));
const database_1 = __importDefault(require("../database"));
// create group
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const { id: userId } = req.user;
    const t = yield database_1.default.transaction(); // Start a transaction
    try {
        const group = yield groupmodel_1.default.create({ name }, { transaction: t });
        yield groupmembermodel_1.default.create({ groupId: group.groupId, userId, isAdmin: true }, { transaction: t });
        yield t.commit(); // Commit the transaction
        res.json({ message: 'Group created successfully', groupId: group.id });
    }
    catch (error) {
        console.error('Error creating group:', error);
        yield t.rollback(); // Rollback the transaction
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createGroup = createGroup;
// add group member
const addGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req.body;
    const { id: adminUserId } = req.user;
    const t = yield database_1.default.transaction(); // Start a transaction
    try {
        const adminUserGroup = yield groupmembermodel_1.default.findOne({
            where: { groupId, userId: adminUserId, isAdmin: true },
            transaction: t,
        });
        if (!adminUserGroup) {
            return res.status(403).json({ message: 'Only group admins can add users' });
        }
        // Check if the user is already a member of the group
        const existingMember = yield groupmembermodel_1.default.findOne({
            where: { groupId, userId },
            transaction: t,
        });
        if (existingMember) {
            return res.status(400).json({ error: 'User is already a member' });
        }
        yield groupmembermodel_1.default.create({ groupId, userId }, { transaction: t });
        yield t.commit(); // Commit the transaction
        res.json({ message: 'User added to group successfully' });
    }
    catch (error) {
        console.error('Error adding user to group:', error);
        yield t.rollback(); // Rollback the transaction 
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addGroupMember = addGroupMember;
// user group remove
const groupRemoveMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req.body;
    const { id: adminUserId } = req.user;
    const t = yield database_1.default.transaction(); // Start a transaction
    try {
        const adminUserGroup = yield groupmembermodel_1.default.findOne({
            where: { groupId, userId: adminUserId, isAdmin: true },
            transaction: t,
        });
        if (!adminUserGroup) {
            return res.status(403).json({ message: 'Only group admins can remove users' });
        }
        yield groupmembermodel_1.default.destroy({ where: { groupId, userId: userId }, transaction: t });
        yield t.commit(); // Commit the transaction
        res.json({ message: 'User removed from group successfully' });
    }
    catch (error) {
        console.error('Error removing user from group:', error);
        yield t.rollback(); // Rollback the transaction 
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.groupRemoveMember = groupRemoveMember;
// delete group
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { id: userId } = req.user;
    try {
        const adminUserGroup = yield groupmembermodel_1.default.findOne({
            where: { groupId, userId, isAdmin: true }
        });
        if (!adminUserGroup) {
            return res.status(403).json({ message: 'Only group admins can delete the group' });
        }
        // Delete associated Group member records
        yield groupmembermodel_1.default.destroy({ where: { groupId } });
        // Delete the group
        yield groupmodel_1.default.destroy({ where: { groupId } });
        res.json({ message: 'Group deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteGroup = deleteGroup;
exports.default = { createGroup: exports.createGroup, addGroupMember: exports.addGroupMember, groupRemoveMember: exports.groupRemoveMember, deleteGroup: exports.deleteGroup };
