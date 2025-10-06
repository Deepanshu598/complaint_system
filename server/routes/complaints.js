const express = require('express');
const router = express.Router();
const { Complaint, ComplaintAction, User } = require('../models');
const { authMiddleware } = require('../middleware/rbac');

router.get('/', authMiddleware, async (req,res)=>{
  const roleName = req.user.role.role_name;
  if(roleName === 'superadmin'){
    const all = await Complaint.findAll();
    return res.json(all);
  }
  if(roleName === 'approver' || roleName === 'reviewer'){
    const list = await Complaint.findAll({ where: { assigned_to: req.user.user_id } });
    return res.json(list);
  }
  const mine = await Complaint.findAll({ where: { user_id: req.user.user_id } });
  res.json(mine);
});

router.get('/:complaintId', authMiddleware, async (req,res)=>{
  const c = await Complaint.findByPk(req.params.complaintId);
  if(!c) return res.status(404).json({ error:'not found' });
  res.json(c);
});

router.post('/', authMiddleware, async (req,res)=>{
  const { description, assign_to_role } = req.body;
  const assignedRole = assign_to_role || 'reviewer';
  const reviewer = await User.findOne({ include: { model: require('../models').Role, as: 'role' }, where: { '$role.role_name$': assignedRole } , order: [['created_at','ASC']] });
  const assigned_to = reviewer ? reviewer.user_id : null;
  const c = await Complaint.create({ user_id: req.user.user_id, assigned_to, description });
  res.json(c);
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
  if(action_type === 'approve') c.status = 'resolved';
  if(action_type === 'reject') c.status = 'closed';
  await c.save();
  res.json({ ok:true, complaint: c });
});

module.exports = router;
