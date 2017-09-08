var HappyPack = require("happypack");
var Webpack = require("webpack");
var wwwroot = __dirname + "/themes/material-flow/source";

module.exports = {
    cache: true,
    entry: {
        "bundle": [wwwroot + "/js/main.js"],        
        "site-stats.min": [wwwroot + "/js/site-stats.js"]
    },
    output: {
        path: wwwroot + "/js",
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js"]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: [/node_modules/],
            loader: "happypack/loader"
        }]
    },
    plugins: [
        new HappyPack({
            loaders: ["babel-loader?presets[]=es2015"]
        }),
        new Webpack.optimize.UglifyJsPlugin(),
        new Webpack.ProvidePlugin({
            $: wwwroot + "/js/lib/jquery-2.2.4.min.js",
            jQuery: wwwroot + "/js/lib/jquery-2.2.4.min.js",
            "window.jQuery": wwwroot + "/js/lib/jquery-2.2.4.min.js",
            Waves: wwwroot + "/js/lib/waves.min.js",
            ScrollReveal: wwwroot + "/js/lib/scrollreveal.min.js"
        }),
    ]
}