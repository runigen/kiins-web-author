const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const license = require('./license.json');

module.exports = {
    entry: './src/index.ts', // 번들링 시작 위치
    output: {
        path: path.join(__dirname, '/build'), // 번들 결과물 위치
        filename: 'meeoocat-player.js',
    },
    // entry: {
    //     'meeoocat-player': './src/index.ts',
    //     apexcharts: ['apexcharts'],
    // },
    // output: {
    //     filename: '[name].js',
    //     path: path.resolve(__dirname, 'build'),
    // },
    // optimization: {
    //     splitChunks: { chunks: 'all' },
    // },
    module: {
        rules: [
            {
                test: /[\.js]$/, // .js 에 한하여 babel-loader를 이용하여 transpiling
                exclude: /node_module/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.ts$/, // .ts 에 한하여 ts-loader를 이용하여 transpiling
                exclude: /node_module/,
                use: {
                    loader: 'ts-loader',
                },
            },
            // {
            //     test: /\.scss$/i,
            //     use: 'sass-loader',
            // },
            // {
            //     test: /\.css$/i,
            //     use: 'raw-loader',
            // },
            {
                test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules'], // 모듈 위치
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // 템플릿 위치

            // 자동 주입 해제
            inject: false,

            // 압축 설정
            minify: true,

            // 문서 메타
            meta: {
                'theme-color': '#4285f4',
                description: 'Meeoocat Player',
            },

            // 사용자 정의 옵션
            templateParameters: {
                title: 'Meeoocat Player', // 문서 타이틀
                lang: 'ko-KR', // 주 언어 명시
            },
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/docs', to: './docs' },
                { from: 'public/res', to: './res' },
            ],
        }),

        new webpack.BannerPlugin({
            banner: `${license.name}
Version: ${license.ver}
Company : ${license.company}
Contact : ${license.email}
copyrightⓒ 2021 All rights reserved by RUNIGEN`,
        }),
    ],

    performance: {
        assetFilter: function (assetFilename) {
            return assetFilename.endsWith('.js');
        },
        maxEntrypointSize: 1024000,
        maxAssetSize: 1024000,
    },

    devServer: {
        host: 'localhost', // live-server host 및 port
        port: 5500,
    },
    mode: 'production', // 번들링 모드 development / production
    devtool: false,
};
