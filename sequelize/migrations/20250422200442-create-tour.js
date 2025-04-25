module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tours', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(40)
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      photos: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING(60))
      },
      isAccommodation: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING(80)
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('tours');
  }
};