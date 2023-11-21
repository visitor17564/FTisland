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
      followId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
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
      modelName: "follow"
    }
  );
  return follow;
};
