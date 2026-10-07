const path = require('path');
const base = require('../../jest.config.base.js');
const pkg = require('./package');

module.exports = {
  ...base,
  displayName: pkg.name,
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '@ohif/(.*)': '<rootDir>/../../platform/$1/src',
    '^@cornerstonejs/([^/]+)/(.*)$': '<rootDir>/../../node_modules/@cornerstonejs/$1/dist/esm/$2',
    '^@cornerstonejs/([^/]+)$': '<rootDir>/../../node_modules/@cornerstonejs/$1/dist/esm',
  },
  // Fork: this package's own babel.config.js is for its build; tests use the shared one.
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: path.join(__dirname, '../../babel.config.js') }],
  },
};
