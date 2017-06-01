# @kennship/gulp-terraform

Run Terraform from Gulp.

## Usage

```javascript
const terraform = require('@kennship/gulp-terraform');

gulp.task('terraform.apply', () => terraform.apply({
  args: {
    state: '/path/to/terraform.tfstate',
    varFile: '.env/production.tfvars',
  }
})
)
```

Each method returns a Promise.

If you have a more complex use case, and you are using Node 8 (or a Babel transform), you may use `async`/`await` to work with Terraform:

```javascript
// Please note that you will need special setup for async/await
async function attemptToDeploy() {
  try {
    await terraform.apply('path/to/config');
  } catch (error) {
    console.error('Problem running Terraform!');
    console.error(error);
  }
}
```

### Methods

```javascript
terraform.apply(positionalArgs, options);
terraform.destroy(positionalArgs, options);
terraform.get(positionalArgs, options);
terraform.import(positionalArgs, options);
terraform.init(positionalArgs, options);
terraform.output(positionalArgs, options);
terraform.plan(positionalArgs, options);
terraform.push(positionalArgs, options);
terraform.refresh(positionalArgs, options);
terraform.show(positionalArgs, options);
terraform.taint(positionalArgs, options);
terraform.untaint(positionalArgs, options);
terraform.validate(positionalArgs, options);
terraform.version(positionalArgs, options);
```

Each of these methods takes an optional array of positional arguments, and an options object. Each method returns a `Promise` that resolves when the Terraform run has completed, or rejects if there is an issue.

`positionalArgs` is either a string or an array of strings used to supply positional arguments at the end of the call. For example, `terraform.apply('path/to/config')` would be run as `terraform apply path/to/config`.

`options` is an object allowing further configuration:

* `args` is a map of CLI argument names to their values. Array values are split into multiple arguments. Arguments passed in camel-case will be converted to the hyphenated form expected by Terraform; for example, `{stateOut: 'some/value'}` would get passed as `-state-out=some/value`. Also, to specify a flag with no value, set its value to `true`.
* `vars` is a map of Terraform variable names to their values. These are set by manipulating the environment variables used for the Terraform call.
* `cwd` is the working directory to call Terraform from. This will make a difference if the configuration is specified as a relative path. The default behavior is to use `process.cwd()`.
* `terraformPath` may be used to provide a path to a Terraform binary. This is useful if your system does not have Terraform in its `PATH` variable.


```javascript
terraform.runCommand(commandName, positionalArgs, options);
```

This method is used to implement the named commands. `terraform.runCommand('apply', opts)` is the same as `terraform.apply(opts)`.


### Examples

```javascript
terraform.apply('path/to/config', {
  args: {
    varFile: '.env/production.tfvars',
  },
  vars: {
    site_domain_name: 'gulpjs.com',
  }
});
// > terraform apply -var-file=.env/production.tfvars path/to/config
// This will also set the Terraform variable "site_domain_name" to the
// value "gulpjs.com".


terraform.validate('path/to/config' {args: {color: false}});
// > terraform validate -no-color path/to/config
// Makes sure that the Terraform files in the given directory are valid, but
// don't show color in the output.
```

## License

MIT
