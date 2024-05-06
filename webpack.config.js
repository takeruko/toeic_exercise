var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
    mode: 'development',
    entry: "./src/js/client.js",
    output: {
        path: `${__dirname}/docs`,
        filename: "client.min.js"
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'docs'),
            publicPath: '/toeic_exercise'
        },
        open: ['/toeic_exercise'],
        historyApiFallback: {
            index: '/toeic_exercise/index.html'
        }
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react', '@babel/preset-env']
                }
            }]
        }]
    },
    plugins: debug ? [] : [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ]
};