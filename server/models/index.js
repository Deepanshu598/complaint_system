const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);
const User = require('./user')(sequelize);
const Role = require('./role')(sequelize);
const Permission = require('./permission')(sequelize);
const RolePermission = require('./role_permission')(sequelize);
const Complaint = require('./complaint')(sequelize);
const ComplaintAction = require('./complaint_action')(sequelize);
const SocialLogin = require('./social_login')(sequelize);

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id' });

User.hasMany(Complaint, { foreignKey: 'user_id' });
Complaint.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Complaint, { foreignKey: 'assigned_to', as: 'AssignedComplaints' });

Complaint.hasMany(ComplaintAction, { foreignKey: 'complaint_id' });

module.exports = {
  sequelize,
  User, Role, Permission, RolePermission, Complaint, ComplaintAction, SocialLogin
};
