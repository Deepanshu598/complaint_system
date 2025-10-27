const express = require('express');
const router = express.Router();
const { User, Role } = require('../models');
const { authMiddleware, permit } = require('../middleware/rbac');
const bcrypt = require('bcrypt');

router.get('/', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const role = req.query.role;
  let where = {};
  if(role){
    const roleObj = await Role.findOne({ where: { role_name: role } });
    if(roleObj) where.role_id = roleObj.role_id;
  }
  const users = await User.findAll({ where, include: Role });
  res.json(users);
});

router.post('/', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const { email, username, first_name, last_name, password, role_name } = req.body;
  const role = await Role.findOne({ where: { role_name } });
  if(!role) return res.status(400).json({ error:'invalid role' });
  if(role.role_name === 'superadmin') return res.status(403).json({ error:'cannot create superadmin' });
  
  const existingUser = await User.findOne({ where: { email } });
  if(existingUser) return res.status(400).json({ error:'user already exists' });
  
  const password_hash = password ? await bcrypt.hash(password, 10) : null;
  const user = await User.create({ 
    email, 
    username: username || email, 
    first_name, 
    last_name, 
    password_hash, 
    role_id: role.role_id 
  });
  res.json(user);
});

router.put('/:userId/roles', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const { userId } = req.params;
  const { role_name } = req.body;
  const user = await User.findByPk(userId);
  if(!user) return res.status(404).json({ error:'user not found' });
  const role = await Role.findOne({ where: { role_name } });
  if(!role) return res.status(400).json({ error:'invalid role' });
  if(role.role_name === 'superadmin') return res.status(403).json({ error:'cannot promote to superadmin' });
  const pending = await require('../models').Complaint.count({ where: { assigned_to: user.user_id, status: 'open' } });
  if(pending>0) return res.status(400).json({ error:'user has pending tasks, clear them first', pending });
  user.role_id = role.role_id;
  await user.save();
  res.json({ ok:true, user });
});

router.post('/:userId/promote-admin', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const { userId } = req.params;
  const user = await User.findByPk(userId);
  if(!user) return res.status(404).json({ error:'user not found' });
  
  const adminRole = await Role.findOne({ where: { role_name: 'approver' } });
  if(!adminRole) return res.status(400).json({ error:'admin role not found' });
  
  user.role_id = adminRole.role_id;
  await user.save();
  res.json({ ok:true, user, message: 'User promoted to admin successfully' });
});

router.post('/:userId/demote-admin', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const { userId } = req.params;
  const user = await User.findByPk(userId);
  if(!user) return res.status(404).json({ error:'user not found' });
  
  const currentRole = await Role.findByPk(user.role_id);
  if(!currentRole || currentRole.role_name !== 'approver') {
    return res.status(400).json({ error:'user is not an admin' });
  }
  
  const pending = await require('../models').Complaint.count({ 
    where: { assigned_to: user.user_id, status: 'open' } 
  });
  if(pending > 0) {
    return res.status(400).json({ 
      error:'admin has pending complaints, reassign them first', 
      pending 
    });
  }
  
  const userRole = await Role.findOne({ where: { role_name: 'user' } });
  if(!userRole) return res.status(400).json({ error:'user role not found' });
  
  user.role_id = userRole.role_id;
  await user.save();
  res.json({ ok:true, user, message: 'Admin demoted to regular user successfully' });
});

router.get('/me', authMiddleware, async (req,res)=>{
  const user = await User.findByPk(req.user.user_id, { include: Role });
  if(!user) return res.status(404).json({ error:'user not found' });
  res.json(user);
});

router.get('/:userId/screen-config', authMiddleware, async (req,res)=>{
  const user = await User.findByPk(req.params.userId, { include: Role });
  if(!user) return res.status(404).json({ error:'not found' });
  const role = user.role ? user.role.role_name : 'user';
  const config = { role, screens: [] };
  if(role === 'superadmin') config.screens = ['users-list','create-user','all-complaints','role-management'];
  if(role === 'approver') config.screens = ['assigned-complaints','reviewers-list'];
  if(role === 'reviewer') config.screens = ['my-complaints','file-review'];
  if(role === 'user') config.screens = ['file-complaint','my-complaints'];
  res.json(config);
});

module.exports = router;
