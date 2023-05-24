const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelOptions = require("./babel.config");
const print = require("../../utils/print");
/**
 * ----------------------------------------
 * WEBPACK CONFIG
 * ----------------------------------------
 */
module.exports = function (userOption, ctx) {
  const browsers = userOption["@browsers"] || ["chrome >= 60"];
  const hash = userOption["@hash"];
  const themeVars = userOption["@themeVars"] || {};
  const HtmlWebpackPluginOption = userOption["@HtmlWebpackPluginOption"] || {};
  const outputPath = userOption.output?.path || ctx.buildFolder + "/dist";
  const saveFolder = userOption["@saveFolder"] === undefined ? "bundle/" : userOption["@saveFolder"];

  const { framework = "react", isPro } = ctx;
  const hashHolder = hash ? ".[contenthash:6]" : ".bundle";
  const sassRule = createScssRules(ctx);
  const babelOps = babelOptions({ browsers })[framework];

  // 检测SCSS全局变量
  const sassVar = path.join(ctx.buildFolder, "style/var.scss");
  if (fs.existsSync(sassVar)) {
    print("use sass global variable");
    sassRule.use.push({
      loader: "sass-resources-loader",
      options: { resources: sassVar },
    });
  }

  const webpackOption = {
    mode: isPro ? "production" : "development",
    entry: "./main/index.js",
    target: "web",
    output: {
      filename: saveFolder + `${ctx.build}${hashHolder}.js`,
      path: outputPath,
      clean: true,
      assetModuleFilename: "assets/[hash][ext]",
    },
    plugins: [
      (compiler) => {
        const { VueLoaderPlugin } = require("vue-loader");
        new VueLoaderPlugin().apply(compiler);
      },
      (compiler) => {
        new MiniCssExtractPlugin({
          filename: saveFolder + `${ctx.build}${hashHolder}.css`,
        }).apply(compiler);
      },
      (compiler) => {
        const Option = require("html-webpack-plugin");
        new Option({
          template: path.join(ctx.buildFolder, "template.html"),
          publicPath: "auto",
          ...HtmlWebpackPluginOption,
        }).apply(compiler);
      },
      (compiler) => {
        const WebpackBar = require("webpackbar");
        new WebpackBar().apply(compiler);
      },
    ],
    devServer: {
      static: {
        directory: outputPath,
      },
      allowedHosts: "all",
      host: "127.0.0.1",
      port: 8000,
      open: true,
    },
    optimization: shouldOpimization(ctx),
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    resolve: {
      extensions: [".js", ".jsx", ".vue"],
    },
    module: {
      rules: [
        { test: /\.vue$/, loader: "vue-loader" },
        {
          test: /\.(js|jsx)$/,
          use: [{ loader: "babel-loader", options: babelOps }],
          exclude: /node_modules/,
        },
        {
          test: /ynw.+js$/,
          use: [{ loader: "babel-loader", options: babelOps }],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
        sassRule,
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: themeVars,
                },
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpe?g|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
  };

  return webpackOption;
};

function createScssRules(ctx) {
  return {
    test: /\.s[ca]ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
          modules: ctx.framework === "vue" ? false : { localIdentName: "[name]-[local]-[hash:base64:5]" },
        },
      },
      "postcss-loader",
      {
        loader: "sass-loader",
        options: { implementation: require("sass") },
      },
    ],
  };
}

// 生产环境启用压缩
function shouldOpimization(ctx) {
  if (!ctx.isPro) return {};
  return {
    minimize: true,
    minimizer: [
      (compiler) => {
        const TerserPlugin = require("terser-webpack-plugin");
        new TerserPlugin({
          terserOptions: { format: { comments: false } },
          extractComments: false,
        }).apply(compiler);
      },
      (compiler) => {
        const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
        new CssMinimizerPlugin().apply(compiler);
      },
    ],
  };
}
