const {NODE_ENV = 'development'} = process.env;

/**
 * Create a Babel configuration.
 *
 * @param [opts] Options for the configuration.
 * @param {"node"|"browser"} [opts.runtime="node"]
 *          Runtime environment for the produced code.
 * @param {"development"|"test"|"production"} [opts.env="development"]
 *          Environment (typically `NODE_ENV`) for the produced code.
 * @param {string[]} [opts.browsers=['>1%', 'IE > 8', 'last 2 versions']]
 *          [Browserslist] strings identifying supported browsers.
 * @param {boolean} [opts.useReactPreset=true]
 *          If false, `babel-preset-react` will be disabled.
 * @param {Object[]} [opts.extraPlugins]
 *          If supplied, will add passed plugins to plugins list.
 * @param {"amd"|"umd"|"systemjs"|"commonjs"|false} [opts.modules="commonjs"]
 *          Sets module transformation.
 *
 * [Browserslist]: https://github.com/ai/browserslist
 */
function createBabelConfig(opts = {}) {
  const {
    runtime = 'node',
    env: nodeEnv = NODE_ENV,
    browsers = ['>1%', 'IE > 8', 'last 2 versions'],
    useReactPreset = true,
    extraPlugins = [],
    modules = 'commonjs',
  } = opts;

  // Set up the options for `babel-preset-env`.
  const envOpts = {
    modules,
  };
  switch (runtime) {
    case 'node':
      envOpts.targets = {node: 4};
      break;
    case 'browser':
      envOpts.targets = {browsers};
      break;
    default:
      throw new Error(`Invalid env "${nodeEnv}" passed to createBabelConfig()`);
  }

  // Set up the plugins list.
  const plugins = [
    // React preset already strips out Flow types.
    ...(useReactPreset ? [] : ['transform-flow-strip-types']),
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-function-bind',
    ...extraPlugins,
  ];

  return {
    presets: [
      ['env', envOpts],
      ...(useReactPreset ? ['react'] : []),
    ],
    plugins,
  };
}

/**
 * Register a `require()` hook in Node with the Node Babel config.
 */
function register(opts = {}) {
  const {polyfill} = opts;
  if (polyfill) require('babel-polyfill');
  require('babel-core/register')(createBabelConfig(opts));
}

module.exports = createBabelConfig;
Object.assign(module.exports, {register});
