"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class follow extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        targetKey: "userId",
        foreignKey: "userId"
      });
    }
  }
  follow.init(
    {
      followId: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "follows"
    }
  );
  return follow;
};
