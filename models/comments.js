"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  comments.init(
    {
      postId: DataTypes.STRING,
      userId: DataTypes.STRING,
      text: DataTypes.STRING,
      like: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "comments"
    }
  );
  return comments;
};
