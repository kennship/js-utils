const baseConfig = require('./_base');

module.exports = Object.assign({}, baseConfig, {
  extends: [...baseConfig.extends],
  rules: Object.assign({}, baseConfig.rules, {
    'flowtype/define-flow-type': 'warn',
    'flowtype/generic-spacing': ['error', 'never'],
    'flowtype/no-dupe-keys': 'error',
    'flowtype/no-primitive-constructor-types': 'error',
    'flowtype/no-weak-types': 'warn',
    'flowtype/object-type-delimiter': ['error', 'comma'],
    'flowtype/require-parameter-type': [
      'error', 'always',
      {excludeArrowFunctions: 'expressionsOnly'},
    ],
    'flowtype/require-return-type': [
      'error', 'always',
      {excludeArrowFunctions: 'expressionsOnly'},
    ],
    'flowtype/require-valid-file-annotation': [
      'error', 'always',
      {annotationStyle: 'line'},
    ],


    'react/jsx-handler-names': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-no-bind': 'error',
  }),
});
