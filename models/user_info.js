"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_info extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        targetKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "userId" // 4. UserInfos 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }
  user_info.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      profile: {
        type: DataTypes.STRING
      },

      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      region: {
        type: DataTypes.STRING
      },
      nation: {
        type: DataTypes.STRING
      },
      nation: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: "user_info"
    }
  );
  return user_info;
};
