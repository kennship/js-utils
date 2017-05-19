module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint:recommended', 'google', 'plugin:react/recommended'],
  plugins: ['flowtype', 'react'],
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {jsx: true},
  },
  env: {
    es6: true,
  },
  rules: {
    semi: ['error', 'always'],
    'no-unused-vars': 'error',
    'spaced-comment': [
      'error',
      'always',
      {markers: [':', '::', 'flow-include']},
    ],
    // Disable `valid-jsdoc` rule because of Flowtype
    'valid-jsdoc': 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],

    // React rules
    'react/jsx-max-props-per-line': ['error', {when: 'multiline'}],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-indent': ['error', 4],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-curly-spacing': ['error', 'never'],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-boolean-value': 'error',
  },
};
