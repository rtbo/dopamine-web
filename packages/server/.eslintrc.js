module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ['standard', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
                pathGroups: [
                    {
                        // common pattern for project source root
                        pattern: '@/**',
                        group: 'parent',
                        position: 'before',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                alphabetize: {
                    order: 'asc',
                },
            },
        ],
    },
}
