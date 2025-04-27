const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

// Configuração simplificada para evitar problemas com tsconfig
module.exports = [
  js.configs.recommended,
  {
    // Usando o sistema correto de ignorar arquivos para configuração flat
    ignores: [
      'dist/**',
      'dist-electron/**',
      'dist-react/**',
      'release/**',
      'node_modules/**',
      '.github/**',
      'out/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.config.js',
      'vite.config.ts'
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        // Removendo a referência ao tsconfig para evitar problemas
      },
      // Definindo globals explicitamente
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    // Usando apenas regras básicas que não exigem type checking
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'off', // Desabilitando esta regra para evitar conflitos com TypeScript
    },
  },
];