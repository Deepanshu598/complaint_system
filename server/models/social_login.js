const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('social_login', {
    login_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID },
    provider: { type: DataTypes.STRING },
    provider_user_id: { type: DataTypes.STRING },
    last_login: { type: DataTypes.DATE }
  }, { timestamps: true, underscored: true });
};
