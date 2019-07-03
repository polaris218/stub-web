var path    = require('path');
var webpack = require('webpack');
var marked = require('marked');
var renderer = new marked.Renderer();
var ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const PUBLIC_PATH = 'http://localhost:3333/static/';


var config = {

  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3333',
    'webpack/hot/only-dev-server',
    './dev_index'
  ],
  output: {
    filename   : 'tracker-api.dev.js',
    path       : path.join(__dirname, 'dist'),
    publicPath : PUBLIC_PATH
  },
  //devtool : 'eval',
  devtool : "#eval-source-map",
  devServer: {
    proxy: {
      '/ajax/*': 'http://localhost:3000'
    },
   headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
   publicPath: PUBLIC_PATH
  },
  debug   : true,
  watch   : true,
  module  : {
    loaders: [{
      test    : /\.js$/,
      loaders : ['babel'],
      exclude : [/node_modules/]
    }, {
      test    : /\.css$/,
      loader  : 'style!css'
    }, {
      test: /\.module.scss$/,
      loader: 'style-loader!css-loader?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded'
    }, {
      test: /^((?!\.module).)*scss$/,
      loader: 'style!css!sass'
    },{
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        "window.jQuery": 'jquery'
    }),
    new webpack.DefinePlugin({
      'IS_LIB': JSON.stringify(false)
    }),
  ],
  resolve: {
    root: path.resolve('./src'),
    extensiions: ['', 'js']
  }
};
module.exports = config;
