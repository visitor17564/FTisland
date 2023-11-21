"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        targetKey: "userId",
        foreignKey: "UserId"
      });
    }
  }
  like.init(
    {
      likeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      target_type: {
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
      DataTypes,
      modelName: "like"
    }
  );
  return like;
};
