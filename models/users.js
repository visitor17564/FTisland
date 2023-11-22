"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      this.hasOne(models.user_infos, {
        sourceKey: "userId",
        foreignKey: "userId"
      });

      this.hasMany(models.likes, {
        sourceKey: "userId",
        foreignKey: "UserId"
      });

      this.hasMany(models.follows, {
        sourceKey: "userId",
        foreignKey: "userId"
      });
      this.hasMany(models.posts, {
        sourceKey: "userId",
        foreignKey: "userId"
      });
    }
  }
  users.init(
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
      profile: {
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
      modelName: "users"
    }
  );
  return users;
};
