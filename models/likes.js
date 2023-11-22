"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        targetKey: "userId",
        foreignKey: "UserId"
      });
    }
  }
  Likes.init(
    {
      userId: DataTypes.STRING,
      targetId: DataTypes.STRING,
      target_type: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Likes"
    }
  );
  return Likes;
};
