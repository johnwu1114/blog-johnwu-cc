var webpack = require("webpack");
var wwwroot = __dirname + "/themes/material-flow/source";

module.exports = {
    cache: true,
    entry: {
        "bundle": [wwwroot + "/js/main.js"],
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
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Waves: "./lib/waves.min.js",
            ScrollReveal: "./lib/scrollreveal.min.js"
        }),
    ]
}