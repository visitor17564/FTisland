"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Refresh_tokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users, {
        targetKey: "userId", // 3. Users 모델의 userId 컬럼을
        foreignKey: "userId" // 4. UserInfos 모델의 UserId 컬럼과 연결합니다.
      });
    }
  }
  Refresh_tokens.init(
    {
      tokenId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId"
        },
        onDelete: "CASCADE"
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
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
      modelName: "Refresh_tokens"
    }
  );
  return Refresh_tokens;
};
