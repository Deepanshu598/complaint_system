const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

async function authMiddleware(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({error:'missing auth'});
  const token = header.replace('Bearer ','').trim();
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const user = await User.findByPk(payload.userId, { include: Role });
    if(!user) return res.status(401).json({error:'invalid user'});
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({error:'invalid token'});
  }
}

function permit(allowedRoles = []){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({error:'not authenticated'});
    const roleName = req.user.role ? req.user.role.role_name : null;
    if(allowedRoles.includes(roleName) || allowedRoles.length===0) return next();
    return res.status(403).json({error:'forbidden'});
  };
}

module.exports = { authMiddleware, permit };
