const conventional = require('@commitlint/config-conventional')

const types = /** @type {string[]} */ (conventional.rules['type-enum'][2])

// commitlint.config.js
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'body-max-line-length': [1, 'always', 250],
        'footer-max-line-length': [1, 'always', Infinity],
        'type-enum': [2, 'always', ['release', ...types]],
    },
}
