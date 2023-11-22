"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        targetKey: "userId",
        foreignKey: "userId"
      });
    }
  }
  Follow.init(
    {
      followId: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Follows"
    }
  );
  return Follow;
};
