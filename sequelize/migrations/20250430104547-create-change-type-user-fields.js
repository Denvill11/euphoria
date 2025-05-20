'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING(160),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('users', 'surname', {
      type: Sequelize.STRING(160),
      allowNull: false,
    });

    await queryInterface.changeColumn('users', 'patronymic', {
      type: Sequelize.STRING(160),
      allowNull: true,
    });
  },
};