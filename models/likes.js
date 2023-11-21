"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        targetKey: "userId",
        foreignKey: "UserId"
      });
    }
  }
  like.init(
    {
      userId: DataTypes.STRING,
      targetId: DataTypes.STRING,
      target_type: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "likes"
    }
  );
  return like;
};
