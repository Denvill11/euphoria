module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN "isAdmin";
    `);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
    `);
  }
};