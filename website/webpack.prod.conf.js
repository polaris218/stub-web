var path    = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var marked = require('marked');
var renderer = new marked.Renderer();
var ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var relativeAssetsPath = './static/dist/gen';
var assetsPath = path.join(__dirname, relativeAssetsPath);

const PUBLIC_PATH = '/dist/gen/';

var config = {
  entry: {
    'tracker-api': [
      './node_modules/react-bootstrap-switch/dist/js/index',
      './index'
    ],
    'live-api': './live_index',
  },
  output: {
    path: assetsPath,
    filename   : '[name].js',
    publicPath : PUBLIC_PATH
  },
  progress: true,
  module  : {
    loaders: [{
      test    : /\.js$/,
      loaders : ['babel'],
      exclude : [/node_modules/]
    }, {
      test    : /\.css$/,
      loader: ExtractTextPlugin.extract('style', "css")
    }, {
      test: /\.module.scss$/,
      loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap=true&sourceMapContents=true')
    }, {
      test: /^((?!\.module).)*scss$/,
      loader: ExtractTextPlugin.extract('style', 'css-loader!sass-loader')
    }, {
      test: /\.html$/,
      loader: 'file-loader?name=[path][name].[ext]!extract-loader!html-loader'
    }, {
      test: /\.md$/,
      loader: "html!markdown?gfm=true&tables=true&breaks=false&pedantic=false&sanitize=false&smartLists=true&smartypants=false"
    }, {
      test: /.json$/,
      loader: 'json'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=image/svg+xml"
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/octet-stream"
    }, {
      test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/font-woff"
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file",
    }]
  },
  markdownLoader: {
      renderer: renderer
  },
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/components/activity-stream/activity-stream-sw.js'),
      filename: "activity-stream-sw.js"
    }),
     // css files from the extract-text-plugin loader
    new ExtractTextPlugin('style.css'),
    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        "window.jQuery": 'jquery'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        // Useful to reduce the size of client-side libraries, e.g. react
        NODE_ENV: JSON.stringify('production')
      },
      'IS_LIB': JSON.stringify(false)
    }),
    // For analysis
    // new BundleAnalyzerPlugin(),
    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  resolve: {
    root: __dirname,
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.json', '.js'],
    alias: { }
  }
};
module.exports = config;