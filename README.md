# Highway Code

React + TypeScript app built with Vite. React Compiler is enabled.

## Development

```sh
pnpm install
pnpm dev
```

Installing dependencies also installs the Husky Git hooks through the `prepare`
script.

TypeScript 7 runs builds and type checks through the `@typescript/native` alias.
The `typescript` alias provides the TypeScript 6 API required by typescript-eslint.

## UI and state

- Tailwind CSS 4 runs through `@tailwindcss/vite`; global styles and shadcn theme
  tokens live in `src/index.css`.
- shadcn/ui uses Base UI, the Nova style, and a neutral theme. Components live in
  `src/components/ui`; `components.json` configures the generator.
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

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm lint`         | Run ESLint; warnings fail the check           |
| `pnpm lint:fix`     | Apply ESLint fixes                            |
| `pnpm format`       | Format the project with Prettier              |
| `pnpm format:check` | Check formatting without writing files        |
| `pnpm typecheck`    | Check the app and Vite config with TypeScript |
| `pnpm check`        | Check formatting, lint, and types             |
| `pnpm check:fix`    | Fix lint and formatting, then check types     |
| `pnpm build`        | Check types and build for production          |
| `pnpm preview`      | Preview the production build                  |

Prettier uses single quotes, no semicolons, two-space indentation, trailing commas,
and LF line endings. EditorConfig keeps editor whitespace settings consistent.
The Tailwind Prettier plugin sorts utility classes, including `cn` and `cva` calls.

ESLint uses the recommended JavaScript, type-aware TypeScript, React Hooks, and
Vite React Refresh rules. It also requires braces, strict equality, explicit type
imports, and no unused variables (prefix intentionally unused bindings with `_`).
Prettier handles formatting; `eslint-config-prettier` disables conflicting lint
rules.

Before each commit, Husky runs lint-staged. Staged JavaScript and TypeScript files
run through ESLint with automatic fixes, then Prettier. Other supported staged
files run through Prettier. Checks that cannot be fixed block the commit.
Run `pnpm check` for validation of the entire project, including types.

## CI

GitHub Actions runs `.github/workflows/ci.yml` on pushes, pull requests, and manual
dispatches. It uses Node.js 26 (matching `flake.nix`) and pnpm 12.9.0, caches the
pnpm store, and installs with a frozen lockfile.
Husky hooks are disabled in CI.

The `Checks` job checks formatting, lint, types, and the production build in
separate steps. New commits cancel older runs for the same branch or pull request.
Run the same checks locally with:

```sh
pnpm check
pnpm build
```
