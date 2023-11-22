"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    static associate(models) {
      this.belongsTo(models.posts, {
        targetKey: "postId",
        foreignKey: "postId"
      });
    }
  }
  comments.init(
    {
      postId: DataTypes.STRING,
      userId: DataTypes.STRING,
      text: DataTypes.STRING,
      like: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "comments"
    }
  );
  return comments;
};
