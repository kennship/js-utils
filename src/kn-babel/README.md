# kn-babel

Ready-to-go no-muss Babel configuration.

## Usage

```bash
npm install --save-dev kn-babel
```

### Node module hook

This method is useful when you want to use Babel for development but don't want to wait for your code to compile. Typically only used in development or for "toy" packages, as there's a small (but noticeable) performance hit.

```js
// index.js
require('kn-babel').register();
require('./some-file-that-needs-babel');
```

### Generating a configuration

This method is useful when you need to generate Babel options to pass to a build tool such as Rollup or Webpack.

```js
// rollup.config.js
import createBabelConfig from 'kn-babel';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'main.js',
  dest: 'bundle.js',
  format: 'cjs',
  plugins: [
    babel(createBabelConfig({runtime: 'browser', modules: false})),
  ],
};
```

#### Options

`createBabelConfig()` accepts an object with the following properties, all of which are optional:

<table>
  <thead>
    <tr>
      <th>property</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>runtime</th>
      <td><code>"node"|"browser"</code></td>
      <td><code>"node"</code></td>
      <td>Runtime environment for the produced code.</td>
    </tr>
    <tr>
      <th>env</th>
      <td><code>"development"|"test"|"production"</code></td>
      <td><code>"development"</code></td>
      <td>Environment (typically <code>NODE_ENV</code>) for the produced code.</td>
    </tr>
    <tr>
      <th>browsers</th>
      <td><code>string[]</code></td>
      <td><code>['>1%', 'IE > 8', 'last 2 versions']</code></td>
      <td><a href="https://github.com/ai/browserslist">Browserslist</a> strings identifying supported browsers.</td>
    </tr>
    <tr>
      <th>useReactPreset</th>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
      <td>If false, <code>babel-preset-react</code> will be disabled.</td>
    </tr>
    <tr>
      <th>extraPlugins</th>
      <td><code>Object[]</code></td>
      <td></td>
      <td>If supplied, will add passed plugins to plugins list.</td>
    </tr>
    <tr>
      <th>modules</th>
      <td><code>"amd"|"umd"|"systemjs"|"commonjs"|false</code></td>
      <td><code>"commonjs"</code></td>
      <td>Sets module transformation.</td>
    </tr>
  </tbody>
</table>
