module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    "sourceType": "module"
  },
  env: {
    browser: true
    // node: true,
    // mocha: true
  },
  // 全局变量: 定义全局变量后，ESLint不会警告"
  globals: {
    expect: true,
    Exception: true,
    test: true
  },
  extends: ["standard",'plugin:vue/recommended'],
  plugins: ["html","vue"],
  rules: {
    // 允许开发过程使用debugger
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    // 要求箭头函数的参数使用圆括号
    "arrow-parens": 2,
    // 要求在注释周围有空行( 要求在块级注释之前有一空行)
    "lines-around-comment": [
      1,
      {
        beforeBlockComment: true
      }
    ],
    // 强制 generator 函数中 * 号周围使用一致的空格
    "generator-star-spacing": [
      2,
      {
        before: true,
        after: true
      }
    ],
    // 强制在 function的左括号之前使用一致的空格
    "space-before-function-paren": ["error", "never"],
    // 允许构造函数首字母非大写
    "new-cap": 0
  }
}
