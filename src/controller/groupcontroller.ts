import { Request, Response } from 'express';
import User from '../model/usermodel';
import Group from '../model/groupmodel';
import GroupMember from '../model/groupmembermodel';




export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, username } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.create({ name, username });
    const groupMember = await GroupMember.create({
      groupId: group.groupId,
      userId: user.id,
      isAdmin: true,
    });
    res.status(201).json({ group, groupMember });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Error creating group' });
  }
};

export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ message: 'Group or user not found' });
    }

    // Check if the requesting user is the group admin
    const isAdmin = await GroupMember.findOne({
      where: { groupId: group.groupId, userId: req.user.id, isAdmin: true },
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only the group admin can add users to the group' });
    }

    await GroupMember.create({ groupId: group.groupId, userId: user.id });

    return res.status(200).json({ message: 'User added to the group' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const groupRemoveMember = async (req:Request,res:Response)=>{
    try {
      const { groupId, userId } = req.params;

      const group = await Group.findByPk(groupId);
      const user = await User.findByPk(userId);
  
      if ( !group || !user) {
        return res.status(404).json({ message: 'Group or user not found' });
      }
  
      // Check if the requesting user is the group admin
      const isAdmin = await GroupMember.findOne({
        where: { groupId: group.groupId, userId: req.user.id, isAdmin: true },
      });
  
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only the group admin can remove users from the group' });
      }
  
      await GroupMember.destroy({ where: { groupId: group.groupId, userId: user.id } });
  
      return res.status(200).json({ message: 'User removed from the group' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  export const deleteGroup = async (req: Request, res: Response)=> {
    try {
      const { groupId } = req.params;
  
      // Check if the requesting user is the group admin
      const isAdmin = await GroupMember.findOne({
        where: { groupId, userId: req.user.id, isAdmin: true },
      });
  
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only the group admin can delete the group' });
      }
  
      await GroupMember.destroy({ where: { groupId } });
      await Group.destroy({ where: { groupId } });
  
      return res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

export default { createGroup, addGroupMember, groupRemoveMember,deleteGroup};