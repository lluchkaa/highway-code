# Highway Code

React + TypeScript app built with Vite. React Compiler is enabled.

## Development

Use Node.js 26 and the pnpm version pinned by `packageManager` in `package.json`.
The Nix development shell provides Node.js 26; enter it with `nix develop` if needed.

```sh
pnpm install
pnpm dev
```

Installing dependencies also installs the Husky Git hooks through the `prepare`
script.

`pnpm-workspace.yaml` enables strict dependency engine and peer-dependency checks.
Incompatible package engines and missing or invalid peers fail installation. Keep
project pnpm policy in this file; an `.npmrc` is not needed for this project.

TypeScript 7 runs builds and type checks through the `@typescript/native` alias.
The `typescript` alias provides the TypeScript 6 API required by typescript-eslint.

## UI and state

- Tailwind CSS 4 runs through `@tailwindcss/vite`; global styles and shadcn theme
  tokens live in `src/index.css`.
- shadcn/ui uses Base UI, the Nova style, and a neutral theme. Components live in
  `src/components/uikit`; `components.json` configures the generator.
- CVA defines component variants. Tailwind Variants is intentionally omitted.
- Import application code through `@/`, which resolves to `src/` in TypeScript
  and Vite.
- Zustand stores live in `src/stores`. The starter counter uses a typed store with
  separate selectors for its count and action.

Add shadcn components as needed:

```sh
pnpm exec shadcn add dialog
```

## Code quality

| Command             | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `pnpm lint`         | Run ESLint; warnings fail the check              |
| `pnpm lint:fix`     | Apply ESLint fixes                               |
| `pnpm format`       | Format the project with Prettier                 |
| `pnpm format:check` | Check formatting without writing files           |
| `pnpm typecheck`    | Check the app and Vite config with TypeScript    |
| `pnpm knip`         | Find unused files, exports, and dependencies     |
| `pnpm check`        | Check formatting, lint, types, and unused code   |
| `pnpm check:fix`    | Fix lint/formatting; check types and unused code |
| `pnpm build`        | Check types and build for production             |
| `pnpm preview`      | Preview the production build                     |

Prettier uses single quotes, no semicolons, two-space indentation, trailing commas,
and LF line endings. EditorConfig keeps editor whitespace settings consistent.
Git enforces LF checkouts for text files through `.gitattributes`. Local environment
files, coverage output, and TypeScript build metadata are ignored by Git;
`.env.example` can be committed as a template.
The Tailwind Prettier plugin sorts utility classes, including `cn` and `cva` calls.

ESLint uses the recommended JavaScript, strict type-aware TypeScript, React Hooks,
Vite React Refresh, and JSX accessibility rules. It requires braces, strict
equality, explicit type imports, exhaustive switches, and no unused variables
(prefix intentionally unused bindings with `_`). Floating and misused promises
remain errors. Unused lint-disable and inline configuration comments are errors.
TypeScript explicitly enables strict checking, checked indexed access, and exact
optional property types in both the app and tooling projects.

Imports are grouped as Node builtins, external packages, `@/` application code,
relative code, and assets, then alphabetized without case sensitivity. Named
imports are sorted too. Inline type imports are preferred. ESLint rejects
duplicate imports, self-imports, and runtime dependency cycles. It preserves
side-effect import order, including CSS. Shared UI primitives cannot import stores
or application entry points; stores cannot import UI or application entry points.
These restrictions resolve paths, so aliases and relative imports are both checked.

Accessibility lint uses `eslint-plugin-jsx-a11y-x`, which supports ESLint 10, and
recognizes the shared `Button` as a native button. Static checks complement tests
and manual keyboard checks as application behavior grows.

Prettier handles formatting; `eslint-config-prettier` disables conflicting lint
rules, followed by the compatible mandatory-braces override. Question JSON is
formatted and checked alongside other supported project files.

Knip follows the Vite app entry and tool configuration to find unused source files,
exports, and dependencies. Its project scope covers source modules/styles and root
tooling modules. It has no speculative entry points or unused-dependency exceptions.
Import `cn` directly from its package; install icon dependencies when UI uses them.
The utility alias and icon-library setting in `components.json` configure future
generator output; they do not require an unused utility file or icon dependency.

Before each commit, Husky runs lint-staged. Staged JavaScript and TypeScript files
run through ESLint with automatic fixes, then Prettier. Other supported staged
files run through Prettier. Checks that cannot be fixed block the commit.
Run `pnpm check` for validation of the entire project, including types and unused
code; these project-wide checks run in CI rather than on each staged file.

## CI

GitHub Actions runs the `quality` workflow in `.github/workflows/quality.yml` on
pushes, pull requests, and manual dispatches. Its `App checks` and `Flake check`
jobs run concurrently. New commits cancel older runs for the same branch or pull
request.

The `Flake check` job validates all declared systems with
`nix flake check --all-systems --no-update-lock-file`, including the Apple Silicon
development shell. The lockfile must already be up to date.

The `App checks` job uses Node.js 26 (matching `flake.nix`) and reads the pnpm version
from `packageManager` in `package.json`. It caches the pnpm store and installs with a
frozen lockfile. It checks formatting, lint,
types, unused code/dependencies, and the production build in separate steps. Husky
hooks are disabled in CI.
Run the same checks locally with:

```sh
nix flake check --all-systems --no-update-lock-file
pnpm check
pnpm build
```
