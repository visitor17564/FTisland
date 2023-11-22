"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      this.hasOne(models.User_infos, {
        sourceKey: "userId",
        foreignKey: "userId"
      });

      this.hasMany(models.Likes, {
        sourceKey: "userId",
        foreignKey: "UserId"
      });

      this.hasMany(models.Follows, {
        sourceKey: "userId",
        foreignKey: "userId"
      });
      this.hasMany(models.Posts, {
        sourceKey: "userId",
        foreignKey: "userId"
      });
    }
  }
  Users.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      kakaoId: {
        type: DataTypes.STRING
      },
      googleId: {
        type: DataTypes.STRING
      },
      username: {
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
      modelName: "Users"
    }
  );
  return Users;
};
