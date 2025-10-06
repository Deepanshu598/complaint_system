const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('complaint_action', {
    action_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    complaint_id: { type: DataTypes.UUID },
    user_id: { type: DataTypes.UUID },
    action_type: { type: DataTypes.ENUM('review','approve','reject') },
    comments: { type: DataTypes.TEXT }
  }, { timestamps: true, underscored: true });
};
