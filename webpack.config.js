const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const PermissionsOutputPlugin = require('webpack-permissions-plugin')

/** @type {import('webpack').Configuration} */
const config = {
    entry: {
        autoenv: './src/autoenv.ts',
        configureNginx: './src/configureNginx.ts',
    },
    target: 'node',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './src/templates',
                    to: './templates',
                },
                {
                    from: './src/bin/',
                    to: './',
                },
            ],
        }),
        new PermissionsOutputPlugin({
            buildFiles: [
                {
                    path: path.resolve(__dirname, 'dist', 'entrypoint.sh'),
                    fileMode: '755',
                },
                {
                    path: path.resolve(__dirname, 'dist', 'healthcheck.sh'),
                    fileMode: '755',
                },
            ],
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
}

module.exports = config
