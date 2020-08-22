const webPackDevConfig = require('../build/webpack.config.dev')
const path = require('path');

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // Make whatever fine-grained changes you need
  config.module.rules.push(...webPackDevConfig.module.rules,{
    test: /\.stories\.js?$/,
    loaders: [require.resolve('@storybook/addon-storysource/loader')],
    enforce: 'pre',
  });
  // Object.assign(config.resolve.alias,{
  //   '@': path.resolve(__dirname, '../src'),
  //    '@assets': path.resolve(__dirname, '../src/assets/')
  // })
  if (mode === 'PRODUCTION') {
    // ...
  }
    // Extend it as you need.
    function resolve(dir) {
      return path.join(__dirname, '..', dir);
    }
  
    config.resolve = {
      extensions: ['.js', '.vue', '.json','.jsx'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': resolve('src')
      }
    };
  // Return the altered config
  // 使用source-map
  // config.devtool = 'source-map';
 
  // config.mode = 'development';

  return config;
};
