import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
export default defineConfig([
 globalIgnores(['dist/**','dev-dist/**','android/**','ios/**','node_modules/**','test_trigger.js']),
 {files:['src/**/*.{js,jsx}'],extends:[js.configs.recommended,reactHooks.configs.flat.recommended,reactRefresh.configs.vite],languageOptions:{globals:globals.browser,parserOptions:{ecmaFeatures:{jsx:true}}},rules:{'no-unused-vars':['error',{varsIgnorePattern:'^React$'}]}},
 {files:['api/**/*.js','tests/**/*.mjs'],extends:[js.configs.recommended],languageOptions:{globals:globals.node}},
 {files:['src/context/AuthContext.jsx','src/pages/Subscribe.jsx'],rules:{'react-refresh/only-export-components':'off'}},
]);
