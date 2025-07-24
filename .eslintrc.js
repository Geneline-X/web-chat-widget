module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Basic rules
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    
    // Relaxed rules for easier development
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console.log for debugging
    
    // ES6 features
    'arrow-spacing': ['error', { 'before': true, 'after': true }],
    'arrow-parens': ['error', 'as-needed'],
    
    // Styling
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'max-len': ['warn', { 'code': 100, 'ignoreComments': true, 'ignoreStrings': true, 'ignoreTemplateLiterals': true }],
    
    // Best practices
    'curly': ['error', 'multi-line'],
    'dot-notation': 'error',
    'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
    'no-else-return': 'error',
    'no-empty-function': 'warn',
    'no-multi-spaces': 'error'
  }
};
