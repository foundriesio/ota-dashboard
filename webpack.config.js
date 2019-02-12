const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const WebpackEntries = require('./webpack.entries');

const isProd = process.env.NODE_ENV === 'production';

const babelLoader = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: true
    }
};

const outPath = path.resolve(__dirname, 'assets/dist');

module.exports = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    cache: true,
    entry: WebpackEntries,
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: outPath
    },
    resolve: {
        extensions: ['.js', '.marko', '.css', '.scss', '.sass'],
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src')
        ]
    },
    node: {
        fs: 'empty'
    },
    optimization: {
        runtimeChunk: 'single'
    },
    module: {
        rules: [
            {
                test: /\.marko$/,
                use: [
                    babelLoader,
                    {
                        loader: 'marko-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                use: [
                    babelLoader
                ]
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: `${__dirname}/postcss.config.js`
                            }
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['assets/dist']),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css'
        })
    ]
};
