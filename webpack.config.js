const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, 'src', 'index.ts'),
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
        })
    ],
    output: {
        filename: 'index.js',
        path: path.join(__dirname, 'public')
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }, ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    externals: {
        'three': 'THREE',
        'lodash': '_'
    }
};