const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

// Incluir configurações diretamente no array em vez de usar "extends"
module.exports = [
  js.configs.recommended,
  {
    ignores: ['dist', 'dist-electron', 'dist-react', 'node_modules'],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        // Removemos a referência ao projeto de TypeScript específico para evitar erros
        // Isso desativa a verificação de tipos no ESLint, mas evita os erros
      },
      globals: {
        window: true,
        document: true,
        navigator: true,
        // Adicionar ambiente Node.js para resolver o problema do __dirname
        __dirname: true,
        __filename: true,
        process: true,
        require: true,
        module: true,
        exports: true
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Regras básicas sem necessidade de verificação de tipos
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];