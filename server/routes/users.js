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
  const password_hash = password ? await bcrypt.hash(password, 10) : null;
  const user = await User.create({ email, username, first_name, last_name, password_hash, role_id: role.role_id });
  res.json(user);
});

router.put('/:userId/roles', authMiddleware, permit(['superadmin']), async (req,res)=>{
  const { userId } = req.params;
  const { role_name } = req.body;
  const user = await User.findByPk(userId);
  if(!user) return res.status(404).json({ error:'user not found' });
  const role = await Role.findOne({ where: { role_name } });
  if(!role) return res.status(400).json({ error:'invalid role' });
  const pending = await require('../models').Complaint.count({ where: { assigned_to: user.user_id, status: 'open' } });
  if(pending>0) return res.status(400).json({ error:'user has pending tasks, clear them first', pending });
  user.role_id = role.role_id;
  await user.save();
  res.json({ ok:true, user });
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
