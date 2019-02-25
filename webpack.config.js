module.exports = {
  mode: 'none',
  entry: __dirname + '/src/hello-webrtc.js',
  output: {
    path: __dirname + '/dist',
    filename: 'hello-webrtc.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ]
  },
}