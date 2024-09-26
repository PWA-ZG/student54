const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        'public/js/post':'./public/js/post.js',
        'public/js/index':'./public/js/index.js',
        'public/sw':'./public/sw.js'
    },
    output: {
        filename: '[name].min.js',
        path: __dirname,
    },
    plugins: [
        new Dotenv()
    ]
};