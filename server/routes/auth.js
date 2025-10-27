const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, SocialLogin, Role } = require('../models');
const bcrypt = require('bcrypt');

router.post('/social-login', async (req, res) => {
  const { provider, provider_user_id, email, first_name, last_name } = req.body;
  if(!provider || !provider_user_id) return res.status(400).json({error:'provider fields required'});
  let user = await User.findOne({ where: { email } });
  if(!user){
    const role = await Role.findOne({ where: { role_name: 'reviewer' } });
    const role_id = role ? role.role_id : 3;
    user = await User.create({ email, username: email, first_name, last_name, role_id });
  }
  await SocialLogin.create({ user_id: user.user_id, provider, provider_user_id, last_login: new Date() });
  const token = jwt.sign({ userId: user.user_id, roleId: user.role_id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user });
});

router.post('/signup', async (req,res)=>{
  const { email, password, first_name, last_name } = req.body;
  if(!email || !password) return res.status(400).json({ error:'email/password required' });
  const exists = await User.findOne({ where: { email } });
  if(exists) return res.status(400).json({ error:'email exists' });
  const hash = await bcrypt.hash(password, 10);
  const role = await Role.findOne({ where: { role_name: 'user' } });
  const role_id = role ? role.role_id : 4;
  const user = await User.create({ email, username: email, password_hash: hash, first_name, last_name, role_id });
  const userWithRole = await User.findByPk(user.user_id, {
    include: [{ model: Role, as: 'role' }]
  });
  const token = jwt.sign({ userId: user.user_id, roleId: user.role_id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user: userWithRole });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ 
    where: { email },
    include: [{ model: require('../models').Role, as: 'role' }]
  });
  if(!user) return res.status(400).json({ error:'invalid' });
  const ok = await bcrypt.compare(password, user.password_hash || '');
  if(!ok) return res.status(400).json({ error:'invalid' });
  const token = jwt.sign({ userId: user.user_id, roleId: user.role_id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user });
});

router.post('/token-refresh', (req,res)=>{ res.json({ ok:true }); });

module.exports = router;
