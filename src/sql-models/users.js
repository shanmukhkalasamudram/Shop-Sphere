const { Model } = require('sequelize');
const { paginatePlugins } = require('./plugins/pagination.plugin');

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate() {}
  }
  users.init(
    {
      user_id: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      metadata: {
        defaultValue: {},
        type: DataTypes.JSON,
      },
      pincode: {
        defaultValue: 'default',
        type: DataTypes.STRING,
      },
      is_flagged: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      phone_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'users',
    }
  );

  paginatePlugins(users);
  return users;
};
