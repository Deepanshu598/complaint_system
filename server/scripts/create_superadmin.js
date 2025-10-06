

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, Role, User } = require('../models');

async function main(){
  await sequelize.authenticate();
  const roles = ['superadmin','approver','reviewer','user'];
  for(const r of roles){
    await Role.findOrCreate({ where: { role_name: r } });
  }
  console.log('Roles ensured');

  const email = process.env.SA_EMAIL || 'admin@example.com';
  const password = process.env.SA_PASSWORD || 'adminpass';

  let user = await User.findOne({ where: { email } });
  if(!user){
    const roleObj = await Role.findOne({ where: { role_name: 'superadmin' } });
    const password_hash = await bcrypt.hash(password, 10);
    user = await User.create({ email, username: email, first_name: 'Super', last_name: 'Admin', password_hash, role_id: roleObj.role_id });
    console.log('Created superadmin:', email);
  } else {
    console.log('Superadmin already exists:', email);
  }

  const token = jwt.sign({ userId: user.user_id, roleId: user.role_id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  console.log('\nUse this JWT for testing (set it in the client auth):\n');
  console.log(token);
  process.exit(0);
}

main().catch(err=>{ console.error(err); process.exit(1); });
