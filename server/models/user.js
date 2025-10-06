const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('user', {
    user_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
    username: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    password_hash: { type: DataTypes.STRING },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING }
  }, { timestamps: true, underscored: true });
};
