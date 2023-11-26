"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User_infos", {
      userId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userId"
        },
        onDelete: "CASCADE"
      },
      profile: {
        type: Sequelize.STRING
      },
      region: {
        type: Sequelize.STRING
      },
      nation: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      introduce: {
        type: Sequelize.STRING
      },
      mbti: {
        type: Sequelize.STRING
      },
      githubUrl: {
        type: Sequelize.STRING
      },
      blogUrl: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User_infos");
  }
};
