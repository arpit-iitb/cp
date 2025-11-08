const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
    rules: [
        { // monaco
            test: /\.ttf$/,
            use: ['file-loader']
        },
        {
            test: /\.ttf$/,
            type: 'asset/resource'
        }
    ],
    plugins: [
        new MonacoWebpackPlugin({
            languages: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'objective-c', 'scss']
        })
    ]
}