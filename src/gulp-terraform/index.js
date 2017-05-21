// @flow
const makeRunner = require('@kennship/gulp-execute');
module.exports = {
  run: makeRunner('terraform', {
    shortName: 'tf',
  }),
};
