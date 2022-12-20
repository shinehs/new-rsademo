const path = require('path');
const webpack = require('webpack');

// 客制化
const {
  override,
  addWebpackAlias,
  addPostcssPlugins,
  fixBabelImports,
  addWebpackPlugin
} = require('customize-cra');

// Postcss 插件
const PostcssPxToViewport = require('postcss-px-to-viewport');
const PostcssNormalize = require('postcss-normalize');

const customWebpackSet = () => (config) => {
  Object.assign(config.output, {
    chunkFilename: '[name].[contenthash:8].js'
  });
  Object.assign(config.optimization.splitChunks, {
    chunks: 'all',
    maxInitialRequests: Infinity,
    minChunks: 2,
    minSize: 12288,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        priority: 20,
        minSize: 40960,
        enforce: true,
        name(module) {
          const packageName = module.context.match(
            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
          )[1];
          let fileName = packageName.replace('@', '').split('@')[0];
          return `package~${fileName}`;
        }
      }
    }
  });
  if (process.env.REACT_APP_ENV !== 'dev') config.devtool = false;
  return config;
};

module.exports = {
  webpack: override(
    // 添加路径别名配置
    addWebpackAlias({
      '@': path.join(__dirname, './src')
    }),
    // 支持 babel-polyfill 按需自动导入
    // addBabelPlugins(['@babel/plugin-transform-runtime', { corejs: { version: 3 } }]),
    // 添加 Postcss 配置
    addPostcssPlugins([
      PostcssPxToViewport({
        viewportWidth: 375, // 视图大小
        viewportUnit: 'vw', // 视图单位
        unitToConvert: 'px', // 需转换的单位
        unitPrecision: 3 // 转换后小数点位数
      }),
      PostcssNormalize({
        forceImport: 'sanitize.css'
      })
    ]),
    // antd-mobile 按需加载
    fixBabelImports('import', {
      libraryName: 'antd-mobile',
      style: 'css'
    }),
    customWebpackSet(),
    addWebpackPlugin()
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 8,
    //   minChunkSize: 1024 * 8
    // })
  ),
  paths: (paths, env) => {
    // 打包时修改默认输出路径以及资源前置路径
    if (env === 'production') {
      console.info(`=> production APP:${process.env.REACT_APP_CODE}<=`);
      console.info(`=> ENV:${process.env.REACT_APP_ENV || '根据域名确定'}  <=`);

      paths.publicUrlOrPath = './';
      paths.appBuild = path.resolve(__dirname, 'dist');
    }

    paths.appHtml = path.resolve(__dirname, 'public/tiya_index.html');
    return paths;
  }
};
