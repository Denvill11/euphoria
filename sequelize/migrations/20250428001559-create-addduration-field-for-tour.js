module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tours', 'duration', {
      type: Sequelize.SMALLINT,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('tours', 'duration');
  }
};
