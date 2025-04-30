'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('tours', 'city', {
      type: Sequelize.STRING(25),
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('tours', 'city');
  }
};
