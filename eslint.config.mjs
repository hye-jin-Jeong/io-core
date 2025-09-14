import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
  },
  {
    plugins: {
      import: (await import('eslint-plugin-import')).default,
    },
    rules: {
      // 순환참조 방지
      'import/no-cycle': 'error',

      // 존재하지 않는 모듈 import 방지
      'import/no-unresolved': 'error',

      // FSD 아키텍처 규칙
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // components는 domains를 import할 수 없음
            {
              target: './src/components/**',
              from: './src/domains/**',
              message: 'Components layer cannot import from domains layer. Use widgets instead.'
            },
            {
              target: './src/components/**',
              from: './src/widgets/**',
              message: 'Components layer cannot import from widgets layer.'
            },

            // domains는 widgets를 import할 수 없음
            {
              target: './src/domains/**',
              from: './src/widgets/**',
              message: 'Domains layer cannot import from widgets layer.'
            },

            // 같은 레벨 도메인 간 직접 import 방지 (단, _common은 허용)
            {
              target: './src/domains/**/!(index.ts|_common)**',
              from: './src/domains/**/!(index.ts|_common)**',
              message: 'Cross-domain imports are not allowed. Use widgets layer or _common directory.'
            },
          ]
        }
      ],

      // import 순서 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index'
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    }
  }
];

export default eslintConfig;
