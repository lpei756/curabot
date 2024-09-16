module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!leven)',
  ],
  setupFiles: ['./jest.setup.js'],
};