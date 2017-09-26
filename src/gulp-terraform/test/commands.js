const {expect} = require('chai');
const sinon = require('sinon');
const tf = require('..');

describe('command convenience functions', function () {
  beforeEach(function () {
    this.runner = sinon.spy(() => Promise.resolve());
  });
  [
    'apply',
    'destroy',
    'get',
    'import',
    'init',
    'output',
    'plan',
    'push',
    'refresh',
    'show',
    'taint',
    'untaint',
    'validate',
    'version',
    'workspace',
  ].forEach((cmdName) => describe(`terraform.${cmdName}`, function () {
    it(`should run the "${cmdName}" command`, function () {
      expect(tf[cmdName]).to.be.a('function');
      return tf[cmdName]({
        runner: this.runner,
        args: {state: '/some/path'},
      }).then(() => {
        expect(this.runner.calledOnce).to.be.true;
        const argv = this.runner.getCall(0).args[0];
        expect(argv.slice(0, 2)).to.deep.equal([
          cmdName,
          '-state=/some/path',
        ]);
      });
    });
  }));
});
