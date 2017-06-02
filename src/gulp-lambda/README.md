# @kennship/gulp-lambda

Bundle AWS Lambda functions from Gulp.

## Usage

```js
// gulpfile.js
const gulp = require('gulp');
const registerLambdaBundler = require('@kennship/gulp-lambda');

registerLambdaBundler(gulp, 'path/to/mypkg', {
  dest: 'dist',
});
```

Done. This creates two Gulp tasks:

```
# Run `npm install` for your lambda
gulp lambda.npm-install

# Generate the ZIP file for your lambda and output to `dist/mypkg.zip`.
# Runs `npm install` first.
gulp lambda.bundle
```

### Using with Gulp v4

```js
// gulpfile.js
const gulp = require('gulp');
const registerLambdaBundler = require('@kennship/gulp-lambda/gulpv4');

registerLambdaBundler(gulp, 'path/to/mypkg', {
  dest: 'dist',
});
```

Because of the way Gulp 4 works, this will create three tasks:

```
# Run `npm install` for your lambda
gulp lambda.npm-install

# Generate the ZIP file for your lambda and output to `dist/mypkg.zip`
gulp lambda.bundle

# Run `npm install` and then generate the ZIP.
gulp lambda
```

## License

MIT
