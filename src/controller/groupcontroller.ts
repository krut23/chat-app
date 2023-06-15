import { Request, Response } from 'express';
import Group from '../model/groupmodel';
import GroupMember from '../model/groupmembermodel';
import sequelize from '../database'; 

// create group
export const createGroup = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id: userId } = req.user;

  const t = await sequelize.transaction(); // Start a transaction

  try {
    const group = await Group.create({ name }, { transaction: t });

    await GroupMember.create(
      { groupId: group.groupId, userId, isAdmin: true },
      { transaction: t }
    );

    await t.commit(); // Commit the transaction

    res.json({ message: 'Group created successfully', groupId: group.id });
  } catch (error) {
    console.error('Error creating group:', error);
    await t.rollback(); // Rollback the transaction
    res.status(500).json({ message: 'Internal server error' });
  }
};

// add group member
export const addGroupMember = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const { id: adminUserId } = req.user;

  const t = await sequelize.transaction(); // Start a transaction

  try {
    const adminUserGroup = await GroupMember.findOne({
      where: { groupId, userId: adminUserId, isAdmin: true },
      transaction: t,
    });

    if (!adminUserGroup) {
      return res.status(403).json({ message: 'Only group admins can add users' });
    }

    // Check if the user is already a member of the group
    const existingMember = await GroupMember.findOne({
      where: { groupId, userId },
      transaction: t,
    });
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    await GroupMember.create({ groupId, userId }, { transaction: t });

    await t.commit(); // Commit the transaction

    res.json({ message: 'User added to group successfully' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    await t.rollback(); // Rollback the transaction 
    res.status(500).json({ message: 'Internal server error' });
  }
};

// user group remove
export const groupRemoveMember = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const { id: adminUserId } = req.user;

  const t = await sequelize.transaction(); // Start a transaction

  try {
    const adminUserGroup = await GroupMember.findOne({
      where: { groupId, userId: adminUserId, isAdmin: true },
      transaction: t,
    });

    if (!adminUserGroup) {
      return res.status(403).json({ message: 'Only group admins can remove users' });
    }

    await GroupMember.destroy({ where: { groupId, userId: userId }, transaction: t });

    await t.commit(); // Commit the transaction

    res.json({ message: 'User removed from group successfully' });
  } catch (error) {
    console.error('Error removing user from group:', error);
    await t.rollback(); // Rollback the transaction 
    res.status(500).json({ message: 'Internal server error' });
  }
};

// delete group
export const deleteGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { id: userId } = req.user;

  try {
    const adminUserGroup = await GroupMember.findOne({
      where: { groupId, userId, isAdmin: true }
    });

    if (!adminUserGroup) {
      return res.status(403).json({ message: 'Only group admins can delete the group' });
    }

    // Delete associated Group member records
    await GroupMember.destroy({ where: { groupId } });

    // Delete the group
    await Group.destroy({ where: { groupId } });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default { createGroup, addGroupMember, groupRemoveMember, deleteGroup };
