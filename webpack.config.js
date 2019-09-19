const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const packageJson = require('./package.json')

module.exports = {
  entry: {
    example: './src/examples/index.ts',
    example_pdf_web_viewer: './src/examples/pdf-web-viewer/index.ts',
    example_pdf_web_viewer_with_options: './src/examples/pdf-web-viewer/with-options.ts',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
        /*
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
      VERSION: JSON.stringify(packageJson.version + '-dev'),
    }),
    */
    new HtmlWebpackPlugin({
      title: 'Output Management',
      filename: 'index.html',
      chunks: ['example'],
      template: 'src/examples/index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Output Management',
      filename: 'pdf_web_viewer.html',
      chunks: ['example_pdf_web_viewer'],
      template: 'src/examples/pdf-web-viewer/index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Output Management',
      filename: 'pdf_web_viewer_with_options.html',
      chunks: ['example_pdf_web_viewer_with_options'],
      template: 'src/examples/pdf-web-viewer/with-options.html',
    }),
    new CopyWebpackPlugin([
      {
        from: 'static/pdfwebviewer',
        test: /libPdfViewerAPI.*/,
        to: 'pdfwebviewer/',
      },
      {
        from: 'static/pdfwebviewer/webworker',
        to: 'pdfwebviewer/webworker/',
      },
      {
        from: 'static/pdfwebviewer/',
        to: 'pdfwebviewer/',
      },
    ], {}),
  ],
  devServer: {
    contentBase: './dist',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.scss' ],
  },
}
