"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_info extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {
        targetKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "userId", // 4. UserInfos 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }
  User_info.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      introduce: {
        type: DataTypes.STRING,
      },
      mbti: {
        type: DataTypes.STRING,
      },
      githubUrl: {
        type: DataTypes.STRING,
      },
      blogUrl: {
        type: DataTypes.STRING,
      },
      profile: {
        type: DataTypes.STRING,
      },
      region: {
        type: DataTypes.STRING,
      },
      nation: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User_infos",
    }
  );
  return User_info;
};
