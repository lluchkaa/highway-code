import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { persistenceRules, uikitRules } from './eslint/ui-policy.js'
import uiStyle from './eslint/ui-style.js'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', 'coverage', '.husky/_', '.ignore']),
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/extensions': [
        '.js',
        '.mjs',
        '.cjs',
        '.jsx',
        '.ts',
        '.tsx',
        '.mts',
        '.cts',
      ],
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './tsconfig.json',
        }),
      ],
    },
    rules: {
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'import-x/no-self-import': 'error',
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          pathGroups: [
            {
              pattern: '**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
              group: 'object',
            },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // import-x/order owns declaration order; this only sorts named members.
      'sort-imports': [
        'error',
        { ignoreDeclarationSort: true, ignoreCase: true },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/**/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/only-throw-error': [
        'error',
        { allow: [{ from: 'lib', name: 'Response' }] },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [
            {
              target: './src/components',
              from: './src/app',
              message: 'Shared UI must not import page-local implementation.',
            },
            {
              target: './src/components/uikit',
              from: './src/components',
              except: ['./uikit'],
              message:
                'UI primitives must not depend on shared application UI.',
            },
            {
              target: './src/app/components',
              from: ['./src/app/practice', './src/app/categories'],
              message:
                'Root-page UI must not depend on child-page implementation.',
            },
            {
              target: './src/app/practice',
              from: ['./src/app/components', './src/app/categories'],
              message:
                'Practice must use shared UI rather than another page’s implementation.',
            },
            {
              target: './src/app/categories',
              from: ['./src/app/components', './src/app/practice'],
              message:
                'Topic practice must use shared UI rather than another page’s implementation.',
            },
            {
              target: './src/components/uikit',
              from: [
                './src/app',
                './src/stores',
                './src/hooks',
                './src/App.tsx',
                './src/main.tsx',
              ],
              message:
                'Shared UI primitives must not depend on application state or entry points.',
            },
            {
              target: './src/stores',
              from: [
                './src/app',
                './src/components',
                './src/hooks',
                './src/App.tsx',
                './src/main.tsx',
              ],
              message:
                'Stores must not depend on UI or application entry points.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/uikit/**'],
    rules: uikitRules,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/stores/persistence/**', '**/*.test.ts'],
    rules: persistenceRules,
  },
  {
    files: ['src/**/*.tsx'],
    extends: [jsxA11y.configs.recommended],
    plugins: { 'ui-style': uiStyle },
    rules: {
      'jsx-a11y-x/control-has-associated-label': 'error',
      'ui-style/component-style': 'error',
      'max-lines-per-function': [
        'error',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
    },
    settings: {
      'jsx-a11y-x': {
        components: { Button: 'button' },
      },
    },
  },
  {
    files: ['src/components/uikit/**/*.tsx'],
    rules: {
      'ui-style/component-style': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    files: [
      'src/components/uikit/button.tsx',
      'src/components/uikit/toggle.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: ['buttonVariants', 'toggleVariants'],
        },
      ],
    },
  },
  {
    files: ['src/components/uikit/chart.tsx'],
    rules: {
      // The generated Recharts tooltip/legend adapter receives polymorphic payloads.
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['src/components/uikit/input-group.tsx'],
    rules: {
      // The generated addon delegates mouse focus to an already keyboard-focusable input.
      'jsx-a11y-x/click-events-have-key-events': 'off',
      'jsx-a11y-x/no-noninteractive-element-interactions': 'off',
    },
  },
  {
    files: ['vite.config.ts', 'playwright.config.ts', 'scripts/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
  {
    rules: {
      // The "all" option is compatible with Prettier; retain this override last.
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
    },
  },
])
