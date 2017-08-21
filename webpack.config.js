var webpack = require("webpack");
var wwwroot = __dirname + "/themes/material-flow/source";

module.exports = {
    cache: true,
    entry: {
        "bundle": [wwwroot + "/js/main.js"],
        "style": [wwwroot + "/css/main.js"],
    },
    output: {
        path: wwwroot + "/js",
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js"]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.(css|less)$/, 
                loader: "style-loader!css-loader!less-loader"
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
                loader: "file-loader",
                options: {
                    name: "/fonts/[name].[ext]",
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),        
        new webpack.ProvidePlugin({
            $: wwwroot+"/js/lib/jquery-2.2.4.min.js",
            jQuery: wwwroot+"/js/lib/jquery-2.2.4.min.js",
            "window.jQuery": wwwroot+"/js/lib/jquery-2.2.4.min.js",
            Waves: wwwroot+"/js/lib/waves.min.js",
            ScrollReveal: wwwroot+"/js/lib/scrollreveal.min.js"
        }),
    ]
}