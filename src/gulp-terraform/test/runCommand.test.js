const {expect} = require('chai');
const sinon = require('sinon');
const tf = require('..');

describe('runCommand', function () {
  beforeEach(function () {
    this.runner = sinon.spy(() => Promise.resolve());
  });
  it('should correctly supply Terraform vars', function () {
    return tf.runCommand('plan', {
      runner: this.runner,
      vars: {
        foo: 'bar',
        some_variable: 'some value',
      },
    })
    .then(() => {
      expect(this.runner.calledOnce).to.be.true;
      const opts = this.runner.getCall(0).args[1];
      const envVars = opts.env;
      expect(envVars).to.have.property('TF_VAR_foo')
        .that.equals('bar');
      expect(envVars).to.have.property('TF_VAR_some_variable')
        .that.equals('some value');
    });
  });
  it('should correctly transform CLI options', function () {
    return tf.runCommand('apply', {
      runner: this.runner,
      args: {
        state: '/some/path',
        stateOut: '/some/other/path',
        var: ['foo=bar', 'baz=quux'],
        color: false,
        fooValue: true,
      },
    }).then(() => {
      expect(this.runner.calledOnce).to.be.true;
      const argv = this.runner.getCall(0).args[0];
      expect(argv).to.have.property(0)
        .that.equals('apply');
      expect(argv.slice(1)).to.have.members([
        '-state=/some/path',
        '-state-out=/some/other/path',
        '-var', 'foo=bar',
        '-var', 'baz=quux',
        '-no-color',
        '-foo-value',
      ]);
    });
  });
});
