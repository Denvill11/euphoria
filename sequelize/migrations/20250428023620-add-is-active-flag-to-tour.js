
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tours', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('tours', 'isActive');
  }
};
