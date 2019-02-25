var config = require('./webpack.config')

module.exports = Object.assign({}, config, {
  entry: __dirname + '/demo/index.js',
  output: {
    filename: 'index.js',
  },
  devServer: {
    index: __dirname + '/demo/index.html',
    contentBase: __dirname + '/demo',
  },
})