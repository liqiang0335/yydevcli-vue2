module.exports = {
  extends: ["eslint:recommended", "plugin:vue/essential"],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    WeixinJSBridge: true,
    wx: true,
    yn: true,
    BMap: true,
    EZuikit: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    strict: 0,
    semi: 2,
    "no-unused-vars": "warn",
    "no-irregular-whitespace": "off",
    "no-console": "off",
  },
};
