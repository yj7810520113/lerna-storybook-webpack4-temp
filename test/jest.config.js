const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  collectCoverage: true,
  collectCoverageFrom: ['modules/**/*.{js,vue}'],
  coverageDirectory: '<rootDir>/test/coverage',
  // collectCoverageFrom: ['modules/**/src/*.js'],
  moduleFileExtensions: ['js', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest'
  },
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue']
}
