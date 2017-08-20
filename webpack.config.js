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
                use: {
                    loader: "babel-loader",
                    query: {
                        presets: ["es2015"]
                    }
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
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Waves: "./lib/waves.min.js",
            ScrollReveal: "./lib/scrollreveal.min.js"
        }),
    ]
}