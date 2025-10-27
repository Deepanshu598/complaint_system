require('dotenv').config();
const { sequelize, User, Role } = require('../models');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const [superadminRole, created] = await Role.findOrCreate({
      where: { role_name: 'superadmin' },
      defaults: { role_name: 'superadmin' }
    });

    const existingSuperAdmin = await User.findOne({
      where: { email: 'superadmin@gmail.com' }
    });

    if (existingSuperAdmin) {
      console.log('Superadmin already exists');
      return;
    }

    const passwordHash = await bcrypt.hash('superadmin@123', 10);
    const superadmin = await User.create({
      email: 'superadmin@gmail.com',
      username: 'superadmin@gmail.com',
      password_hash: passwordHash,
      first_name: 'Super',
      last_name: 'Admin',
      role_id: superadminRole.role_id
    });

    console.log('Superadmin created successfully:', {
      email: superadmin.email,
      role: 'superadmin'
    });

  } catch (error) {
    console.error('Error creating superadmin:', error);
  } finally {
    await sequelize.close();
  }
}

createSuperAdmin();