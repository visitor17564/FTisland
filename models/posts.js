"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        targetKey: "userId",
        foreignKey: "userId"
      });

      this.hasMany(models.comments, {
        sourceKey: "postId",
        foreignKey: "postId"
      });
    }
  }
  posts.init(
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
      region: {
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
      state: {
        type: DataTypes.STRING,
        allowNull: false
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
      modelName: "posts"
    }
  );
  return posts;
};
