var path = require('path')
var webpack = require('webpack')

var bannerPlugin = new webpack.BannerPlugin({
  banner: '// { "framework": "Vue" }\n',
  raw: true
})

var entry = { 'bundle': path.resolve('example', 'entry.js') }
var output = {
  path: path.resolve(__dirname, './example/dist'),
  filename: '[name].weex.js'
}

var nativeConfig = {
  entry: entry,
  output: output,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.vue(\?[^?]+)?$/,
        loaders: ['weex-loader']
      }
    ]
  },
  plugins: [bannerPlugin]
}


var webConfig = {
  entry: entry,
  output: output,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.vue(\?[^?]+)?$/,
        loaders: ['vue-loader']
      }
    ]
  }
}

module.exports = [nativeConfig, webConfig]
