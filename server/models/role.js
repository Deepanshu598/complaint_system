const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('role', {
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role_name: { type: DataTypes.STRING }
  }, { timestamps: false, underscored: true });
};
