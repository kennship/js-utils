const baseConfig = require('./_base');

module.exports = Object.assign({}, baseConfig, {
  rules: Object.assign({}, baseConfig.rules, {
    'require-jsdoc': 'never',
  }),
});
