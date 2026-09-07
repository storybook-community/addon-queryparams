import { createRequire } from 'node:module';

import storybook from 'eslint-plugin-storybook';
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

// eslint-plugin-react@7.37.5 predates ESLint 10 and still calls context methods it
// removed. Its `version: 'detect'` setting is one of them (`context.getFilename()`),
// so resolve the installed React version here instead. The other two are the
// `react/jsx-filename-extension` and `react/forward-ref-uses-ref` rules — both off in
// the recommended config below; don't enable them until the plugin catches up.
const reactVersion = createRequire(import.meta.url)('react/package.json').version;

export default [
  {
    ignores: [
      '.github/dependabot.yml',
      '!.*',
      '*.tgz',
      'dist/',
      'scripts/',
      'coverage/',
      'node_modules/',
      'storybook-static/',
      'build-storybook.log',
      '.DS_Store',
      '.env',
      '.idea',
      '.vscode',
    ],
  },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    settings: {
      react: {
        version: reactVersion,
      },
    },
  },
  ...tseslint.configs.recommended,
  ...storybook.configs['flat/recommended'],
  prettierRecommended,
];
