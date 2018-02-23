const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputDir = "build";
module.exports = {
    entry: [
        "react-hot-loader/patch",
        "bootstrap-loader",
        "./src/index.tsx",
    ],
    output: {
        path: path.join(__dirname, outputDir),
        filename: "bundle.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: 'Unibeautify Playground',
            chunksSortMode: 'dependency',
            template: path.resolve(__dirname, './src/index.ejs')
        }),
        new CleanWebpackPlugin([outputDir])
    ],

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loaders: [
                    "react-hot-loader/webpack",
                    "awesome-typescript-loader"
                ],
                exclude: path.resolve(__dirname, 'node_modules'),
                include: path.resolve(__dirname, "src"),
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // {
            //     test: /\.js$/,
            //     loader: 'babel-loader',
            //     // exclude: path.resolve(__dirname, 'node_modules'),
            //     query: {
            //         presets: ['es2015'],
            //     }
            // },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: path.resolve(__dirname, 'node_modules'),
            },
            {
                test: /\.css$/,
                loaders: [ 'style-loader', 'css-loader' ]
            },
            {
              test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
              use: [{
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  publicPath: '../'
                }
              }]
            }
        ]
    },

    devServer: {
        hot: true
    }

};