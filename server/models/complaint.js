const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('complaint', {
    complaint_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID },
    assigned_to: { type: DataTypes.UUID },
    status: { type: DataTypes.ENUM('open','checked','resolved','closed'), defaultValue: 'open' },
    description: { type: DataTypes.TEXT }
  }, { timestamps: true, underscored: true });
};
