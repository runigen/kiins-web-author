module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-inferrable-types': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'warn',
        'prefer-const': 'warn',
        'no-empty': 'warn',
        'no-unexpected-multiline': 'warn',
        'no-useless-escape': 'warn',
        'no-inner-declarations': 'warn',
        'no-unsafe-finally': 'warn',
        'no-constant-condition': 'warn',
        'no-var': 'warn',
        'no-case-declarations': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
    },
};
