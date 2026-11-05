import { RuleTester } from 'eslint'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import tseslint from 'typescript-eslint'

import { persistenceRules, uikitRules } from './ui-policy.js'

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } })

function check(name, config, valid, invalid) {
  tester.run(name, builtinRules.get(name), {
    valid: valid.map((code) => ({
      code,
      filename: 'view.tsx',
      options: config.slice(1),
    })),
    invalid: invalid.map((code) => ({
      code,
      filename: 'view.tsx',
      options: config.slice(1),
      errors: 1,
    })),
  })
}

check(
  'no-restricted-syntax',
  uikitRules['no-restricted-syntax'],
  [
    'const view = <Button />',
    'const view = <section><Card /></section>',
    'const view = <svg />',
  ],
  ['button', 'input', 'select', 'textarea', 'progress', 'dialog'].map(
    (tag) => `const view = <${tag} />`,
  ),
)
check(
  'no-restricted-imports',
  uikitRules['no-restricted-imports'],
  [
    "import { Button } from '@/components/uikit'",
    "import { RadialBar } from 'recharts'",
  ],
  [
    "import { Button } from '@/components/uikit/button'",
    "import { Button } from '../uikit/button'",
    "import { Button } from '@base-ui/react/button'",
  ],
)
check(
  'no-restricted-globals',
  persistenceRules['no-restricted-globals'],
  [
    'function read(localStorage) { return localStorage.getItem("key") }',
    'const options = { localStorage: {} }',
  ],
  ['localStorage.getItem("key")', 'sessionStorage.setItem("key", "value")'],
)
check(
  'no-restricted-properties',
  persistenceRules['no-restricted-properties'],
  [
    'storage.getItem("key")',
    'window.matchMedia("(prefers-color-scheme: dark)")',
  ],
  [
    'window.localStorage.getItem("key")',
    'globalThis.sessionStorage.getItem("key")',
    'window["localStorage"].removeItem("key")',
  ],
)
