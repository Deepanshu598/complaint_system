const express = require('express');
const router = express.Router();
const { Complaint, ComplaintAction, User } = require('../models');
const { authMiddleware } = require('../middleware/rbac');

router.get('/', authMiddleware, async (req,res)=>{
  const roleName = req.user.role.role_name;
  if(roleName === 'superadmin'){
    const all = await Complaint.findAll({
      include: [
        { model: require('../models').User, as: 'user', attributes: ['user_id', 'email', 'first_name', 'last_name'] },
        { model: require('../models').User, as: 'assignedUser', attributes: ['user_id', 'email', 'first_name', 'last_name'] }
      ]
    });
    return res.json(all);
  }
  if(roleName === 'approver' || roleName === 'reviewer'){
    const list = await Complaint.findAll({ where: { assigned_to: req.user.user_id } });
    return res.json(list);
  }
  const mine = await Complaint.findAll({ where: { user_id: req.user.user_id } });
  res.json(mine);
});

router.get('/admin-overview', authMiddleware, async (req,res)=>{
  if(req.user.role.role_name !== 'superadmin'){
    return res.status(403).json({ error: 'SuperAdmin access required' });
  }
  
  const adminRole = await require('../models').Role.findOne({ where: { role_name: 'approver' } });
  const admins = await require('../models').User.findAll({
    where: { role_id: adminRole.role_id },
    include: [
      {
        model: require('../models').Complaint,
        as: 'assignedComplaints',
        include: [
          { model: require('../models').User, as: 'user', attributes: ['user_id', 'email', 'first_name', 'last_name'] }
        ]
      }
    ]
  });
  
  res.json(admins);
});

router.get('/:complaintId', authMiddleware, async (req,res)=>{
  const c = await Complaint.findByPk(req.params.complaintId);
  if(!c) return res.status(404).json({ error:'not found' });
  res.json(c);
});

router.post('/', authMiddleware, async (req,res)=>{
  const { description, assign_to_role, assign_to_admin } = req.body;
  
  // If SuperAdmin is assigning to specific admin
  if (req.user.role.role_name === 'superadmin' && assign_to_admin) {
    const admin = await User.findByPk(assign_to_admin);
    if (!admin || admin.role_id !== (await require('../models').Role.findOne({ where: { role_name: 'approver' } })).role_id) {
      return res.status(400).json({ error: 'Invalid admin assignment' });
    }
    const c = await Complaint.create({ user_id: req.user.user_id, assigned_to: assign_to_admin, description });
    return res.json(c);
  }
  
  const assignedRole = assign_to_role || 'approver';
  const admin = await User.findOne({ 
    include: { model: require('../models').Role, as: 'role' }, 
    where: { 
      '$role.role_name$': assignedRole
    }, 
    order: [['created_at','ASC']] 
  });
  
  const assigned_to = admin ? admin.user_id : null;
  const c = await Complaint.create({ user_id: req.user.user_id, assigned_to, description });
  return res.json(c);
});

router.post('/:complaintId/action', authMiddleware, async (req,res)=>{
  const { action_type, comments } = req.body;
  const c = await Complaint.findByPk(req.params.complaintId);
  if(!c) return res.status(404).json({ error:'not found' });
  const roleName = req.user.role.role_name;
  if(action_type === 'review' && roleName !== 'reviewer' && roleName !== 'superadmin') return res.status(403).json({ error:'forbidden' });
  if((action_type === 'approve' || action_type === 'reject') && roleName !== 'approver' && roleName !== 'superadmin') return res.status(403).json({ error:'forbidden' });
  await ComplaintAction.create({ complaint_id: c.complaint_id, user_id: req.user.user_id, action_type, comments });
  if(action_type === 'review') c.status = 'checked';
  if(action_type === 'approve') c.status = 'approve';
  if(action_type === 'reject') c.status = 'closed';
  await c.save();
  res.json({ ok:true, complaint: c });
});

router.post('/:complaintId/resolve', authMiddleware, async (req,res)=>{
  const { comments } = req.body;
  const c = await Complaint.findByPk(req.params.complaintId);
  if(!c) return res.status(404).json({ error:'complaint not found' });
  
  const roleName = req.user.role.role_name;
  if(roleName !== 'approver' && roleName !== 'superadmin') {
    return res.status(403).json({ error:'only admins can resolve complaints' });
  }
  
  await ComplaintAction.create({ 
    complaint_id: c.complaint_id, 
    user_id: req.user.user_id, 
    action_type: 'approve', 
    comments: comments || 'Complaint resolved by admin' 
  });
  
  c.status = 'resolved';
  await c.save();
  
  res.json({ ok:true, complaint: c, message: 'Complaint resolved successfully' });
});

router.post('/:complaintId/assign', authMiddleware, async (req,res)=>{
  const { admin_id } = req.body;
  const c = await Complaint.findByPk(req.params.complaintId);
  if(!c) return res.status(404).json({ error:'complaint not found' });
  
  if(req.user.role.role_name !== 'superadmin'){
    return res.status(403).json({ error:'SuperAdmin access required' });
  }
  
  const admin = await User.findByPk(admin_id);
  if(!admin || admin.role_id !== (await require('../models').Role.findOne({ where: { role_name: 'approver' } })).role_id) {
    return res.status(400).json({ error: 'Invalid admin' });
  }
  
  c.assigned_to = admin_id;
  await c.save();
  
  res.json({ ok:true, complaint: c, message: 'Complaint assigned successfully' });
});

module.exports = router;
