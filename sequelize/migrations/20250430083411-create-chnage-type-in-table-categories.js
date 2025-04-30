'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('categories', 'title', {
      type: Sequelize.STRING(30),
      allowNull: false
    });

    await queryInterface.changeColumn('categories', 'iconPath', {
      type: Sequelize.STRING(60),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('categories', 'title', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('categories', 'iconPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
