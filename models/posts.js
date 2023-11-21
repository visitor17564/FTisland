'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  posts.init({
    userId: DataTypes.STRING,
    title: DataTypes.STRING,
    subjtitle: DataTypes.STRING,
    region: DataTypes.STRING,
    contents: DataTypes.STRING,
    like: DataTypes.STRING,
    comment: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};