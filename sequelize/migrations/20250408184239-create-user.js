module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(30)
      },
      surname: {
        type: Sequelize.STRING(30)
      },
      patronymic: {
        type: Sequelize.STRING(30)
      },
      password: {
        type: Sequelize.STRING(60)
      },
      avatarPath: {
        allowNull: true,
        type: Sequelize.STRING(45)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING(45)
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isAdmin: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};