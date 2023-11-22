"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate(models) {
      this.belongsTo(models.Posts, {
        targetKey: "postId",
        foreignKey: "postId"
      });
    }
  }
  Comments.init(
    {
      postId: DataTypes.STRING,
      userId: DataTypes.STRING,
      text: DataTypes.STRING,
      like: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Comments"
    }
  );
  return Comments;
};
