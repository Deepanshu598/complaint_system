const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('role_permission', {
    role_id: { type: DataTypes.INTEGER, primaryKey: true },
    permission_id: { type: DataTypes.INTEGER, primaryKey: true }
  }, { timestamps: false, underscored: true });
};
