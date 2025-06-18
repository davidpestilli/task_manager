import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', 'build', '*.config.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { 
      react: { version: '18.2' } 
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // React specific rules
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      
      // React Hooks rules
      'react-hooks/exhaustive-deps': 'warn',
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // JavaScript best practices
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'semi': ['error', 'never'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'max-len': ['warn', { 
        code: 100, 
        ignoreUrls: true, 
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true
      }],
      
      // Code quality
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'keyword-spacing': 'error',
      'space-before-blocks': 'error',
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // ES6+ features
      'arrow-spacing': 'error',
      'arrow-parens': ['error', 'as-needed'],
      'template-curly-spacing': ['error', 'never'],
      'rest-spread-spacing': ['error', 'never'],
      'no-duplicate-imports': 'error',
      'import/no-duplicates': 'off',
      
      // Accessibility hints
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      
      // Performance hints
      'no-inner-declarations': 'error',
      'no-loop-func': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-array-constructor': 'error',
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-new-func': 'error'
    },
  },
  {
    files: ['**/*.config.js', '**/*.config.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/utils/**/*.js', 'src/services/**/*.js'],
    rules: {
      'no-console': 'off', // Permitir console.log em utilitários
    },
  },
  {
    files: ['src/components/**/*.jsx'],
    rules: {
      'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      'complexity': ['warn', { max: 10 }],
    },
  },
  {
    files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'max-lines': 'off',
    },
  },
]