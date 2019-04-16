const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        output: {
            libraryExport: 'default'
        },
        plugins: [
            new CompressionWebpackPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                threshold: 10240,
                minRatio: 0.8
            }),
            new BundleAnalyzerPlugin()
        ]
    },
    // 将 examples 目录添加为新的页面
    pages: {
        index: {
            // page 的入口
            entry: 'examples/main.ts',
            // 模板来源
            template: 'public/index.html',
            // 输出文件名
            filename: 'index.html'
        }
    }
}
