const baseConfig = require('./_base');

module.exports = Object.assign({}, baseConfig, {
  extends: [...baseConfig.extends],
  rules: Object.assign({}, baseConfig.rules, {
    'react/jsx-handler-names': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-no-bind': 'error',
  }),
});
