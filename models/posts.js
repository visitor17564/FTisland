"use strict";
const { Model } = require("sequelize");
// const sequelize = require("../config/(데이터 베이스가 어디지?")

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        targetKey: "userId",
        foreignKey: "userId"
      });

      this.hasMany(models.Comments, {
        sourceKey: "postId",
        foreignKey: "postId"
      });

      this.hasMany(models.Likes, {
        sourceKey: "postId",
        foreignKey: "targetId"
      });
    }
  }
  Posts.init(
    {
      postId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subtitle: {
        type: DataTypes.STRING
      },
      mbit: {
        type: DataTypes.STRING
      },
      contents: {
        type: DataTypes.STRING,
        allowNull: false
      },
      like: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      comment: {
        type: DataTypes.STRING
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "Posts"
    }
  );
  return Posts;
};
