"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate(models) {
      this.belongsTo(models.Posts, {
        targetKey: "postId",
        foreignKey: "postId",
      });
    }
  }
  Comments.init(
    {
      commentsId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      postId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Posts",
          key: "postId",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      like: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Comments",
    }
  );
  return Comments;
};
