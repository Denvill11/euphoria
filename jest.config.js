module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.dto.ts',
    '!**/dto/**',
    '!**/helpers/middleware/**',
    '!**/helpers/utils/**',
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    'test',
    'coverage',
    '.eslintrc.js',
    'jest.config.js',
    'sequelize',
    'migrations',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^sequelize/(.*)$': '<rootDir>/../sequelize/$1',
  },
}; 