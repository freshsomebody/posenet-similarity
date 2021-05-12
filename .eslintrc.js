module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard',
    "plugin:@typescript-eslint/recommended"
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error", {
      "functions": false,
      "enums": false,
      "typedefs": false
    }],

    "@typescript-eslint/member-delimiter-style": ["error", {
      "multiline": {
          "delimiter": "none",
          "requireLast": false
      },
      "singleline": {
          "delimiter": "comma",
          "requireLast": false
      },
      "multilineDetection": "brackets"
    }]
  }
}
