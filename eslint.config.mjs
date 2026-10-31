import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist', '.yarn', 'test'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    { languageOptions: { globals: globals.node } },
    {
        files: ['**/*.js'],
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    }
)
