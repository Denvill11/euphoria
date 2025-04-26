module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TYPE "application_status" AS ENUM ('pending', 'approved', 'rejected');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "organization_status" AS ENUM (
        'active',
        'liquidating',
        'liquidated',
        'bankrupt',
        'reorganizing',
        'pending'
      );
    `);

    await queryInterface.createTable('organization_applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      organizationName: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      innOrOgrn: {
        type: Sequelize.STRING(13),
        allowNull: false,
      },
      organizationStatus: {
        type: 'organization_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      adminApprove: {
        type: 'application_status',
        allowNull: false,
        defaultValue: 'pending',
      },
      autoApproval: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('organization_applications');
    await queryInterface.sequelize.query(`DROP TYPE "application_status";`);
    await queryInterface.sequelize.query(`DROP TYPE "organization_status";`);
  },
};
