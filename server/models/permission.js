const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('permission', {
    permission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    permission_name: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT }
  }, { timestamps: false, underscored: true });
};
