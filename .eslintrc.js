module.exports = {
    env: {
        browser: false,
        node: true,
        es2021: true,
    },
    extends: ['standard'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        indent: 0,
        'comma-dangle': 0,
    },
}
