const {CLIEngine} = require('eslint');

const eslintrc = require('../');

const cli = new CLIEngine({
  useEslintrc: false,
  baseConfig: eslintrc,

  rules: {
    // It is okay to import devDependencies in tests.
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],
    // this doesn't matter for tests
    'lines-between-class-members': 0,
  },
});

function lint(text) {
  // @see http://eslint.org/docs/developer-guide/nodejs-api.html#executeonfiles
  // @see http://eslint.org/docs/developer-guide/nodejs-api.html#executeontext
  const linter = cli.executeOnText(text);
  return linter.results[0];
}

describe('verify some sample source code', () => {
  test('case 1', () => {
    const src = `
import {foo} from 'babel-eslint';

export default function baz() {
  const obj = {foo};
  foo.bar();
  foo.baz++;
  return obj.mumble;
}
`;
    const result = lint(src);
    expect(result.errorCount).toBe(0);
  });
  test('case 2', () => {
    const src = `
export const foo = { bar: 'should not allow spacing' };
export function baz () { throw new Error('Should not permit space after function'); }
export const mumble = {
  should: 'require',
  trailing: 'commas'
} // no semi
`;
    const result = lint(src);
    const findMessage = (ruleId) => result.messages.find(m => m.ruleId === ruleId);
    const commaDangle = findMessage('comma-dangle');
    const spaceBeforeFuncParen = findMessage('space-before-function-paren');
    const objectCurlySpacing = findMessage('object-curly-spacing');
    const semi = findMessage('semi');
    expect(commaDangle).toBeTruthy();
    expect(spaceBeforeFuncParen).toBeTruthy();
    expect(objectCurlySpacing).toBeTruthy();
    expect(semi).toBeTruthy();
  });

})