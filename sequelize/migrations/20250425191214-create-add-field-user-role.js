
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TYPE user_role AS ENUM ('user', 'admin', 'organizer');
    `);

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin', 'organizer'),
      allowNull: false,
      defaultValue: 'user',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'role');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role;');
  }
};