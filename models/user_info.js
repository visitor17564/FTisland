"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_info.init(
    {
      profile: DataTypes.STRING,
      username: DataTypes.STRING,
      region: DataTypes.STRING,
      nation: DataTypes.STRING,
      follow: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "user_infos"
    }
  );
  return user_info;
};
