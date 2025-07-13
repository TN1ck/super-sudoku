import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import immutable from 'eslint-plugin-immutable';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  eslint.configs.recommended,

  // TypeScript files (browser environment)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.config.{js,ts}', 'scripts/**/*.{js,ts}', '**/*.worker.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      'immutable': immutable,
      'simple-import-sort': simpleImportSort,
      'react': react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'curly': ['warn', 'all'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-children-prop': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'no-case-declarations': 'off',
      'no-empty': 'off',
      'no-constant-condition': 'off',
      'no-cond-assign': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
      'no-func-assign': 'off',
      'no-fallthrough': 'off',
      'no-control-regex': 'off',
      'no-misleading-character-class': 'off',
      'no-sparse-arrays': 'off',
      'valid-typeof': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // TypeScript worker files
  {
    files: ['**/*.worker.{ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.worker,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'no-undef': 'error',
    },
  },

  // Ignore build output and other files
  {
    ignores: ['dist/**', 'node_modules/**', '*.min.js', 'coverage/**', 'postcss.config.js', 'prettier.config.js', 'tailwind.config.js'],
  },
];
