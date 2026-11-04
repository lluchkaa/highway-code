# Highway Code

Ukrainian driving-theory practice built with React, TypeScript, and Vite.
React Compiler is enabled. No account or backend is required.

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
- Zustand stores live in `src/stores`; application hooks live in `src/hooks` and
  components in `src/components`. The progress store uses Zustand's `persist`
  middleware with Zod-validated localStorage under `highway-code:progress`.
- The theme selector defaults to System and offers Light and Dark overrides.
  `useTheme` and `useThemeSync` use a Zustand store whose preference is validated
  with Zod and persisted under `highway-code:theme`. System mode follows changes
  while the page is open; invalid preferences fall back to System.
- Explanations are rendered with `react-markdown`, styled with Tailwind. Raw HTML
  is skipped. Missing source explanations show an explicit placeholder.

Add shadcn components as needed:

```sh
pnpm exec shadcn add dialog
```

## Quiz data and behavior

The homepage lists all 71 topics, grouped into general rules and additional
license categories. Search and filters narrow the list. Opening a topic starts
at its first question; `Продовжити` opens its last visited question. The question
bar and number input allow navigation in any order.

Clicking an answer immediately saves it and shows correctness and its explanation.
Revisiting restores that answer. `Спробувати ще раз` keeps the saved answer until
a new answer replaces it. After the last numbered question, `Наступна категорія`
opens the next topic, even when earlier questions were skipped. The final topic
returns to the list. Category and global reset actions require confirmation.

Source question JSON, images, and the asset manifest live in
`public/assets/questions`. `catalog.json` lives beside them and contains only
category metadata: ID, normalized title, license group, count, first-question ID,
and a content revision. It contains no question array. Regenerate it after changing
the source data:

```sh
pnpm catalog:generate
```

The generator shares Zod schemas with the app. It checks category counts, answer
indexes, distinct options, unique question IDs, and local image mappings/files.
`catalog:check` verifies the committed catalog matches the source; development,
production builds, and `check` fail if it is stale. Answer and question order are
preserved because some answers refer to other options by number. Scraped `status`
and `is_pro` fields never initialize progress or restrict access.

React Router data loaders fetch and validate the catalog at the root and preload
the selected category before rendering a question. Question JSON and local image
paths are loaded on demand and cached in memory. Local image paths come from the
existing manifest, which is fetched once when an illustrated category is opened.
Zod transforms handle title normalization, route parameters, local image paths,
and recovery of partially invalid saved data.

Progress includes the latest answer and resume position. Zod rejects malformed
stored entries while preserving valid ones, and category revisions invalidate
answers if that category's content changes. Loading a category also reconciles
answers with its actual questions. If localStorage is blocked or full, practice
continues in memory with a visible storage notice. Data stays in that browser;
there is no cross-device sync.

## Routing and document metadata

React Router 8 uses hash URLs such as
`/highway-code/#/categories/1/questions/608`, with stable source question IDs.
Copied links and refreshes work on GitHub Pages without a server rewrite.
The router is created only in `src/components/app-router.tsx`; route patterns
and link builders live in `src/lib/routes.ts`. On a host with SPA rewrites,
replace `createHashRouter` with `createBrowserRouter` there and set its `basename`
to `import.meta.env.BASE_URL`. No question or category link needs to change.

Each page renders a title, description, and Open Graph metadata through React 19's
built-in head elements. Search indexing, prerendering, and server rendering are
outside the current scope.

## Code quality

| Command                 | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `pnpm lint`             | Run ESLint; warnings fail the check                                 |
| `pnpm lint:fix`         | Apply ESLint fixes                                                  |
| `pnpm format`           | Format the project with Prettier                                    |
| `pnpm format:check`     | Check formatting without writing files                              |
| `pnpm typecheck`        | Check the app and Vite config with TypeScript                       |
| `pnpm catalog:generate` | Generate the category metadata catalog                              |
| `pnpm catalog:check`    | Validate question data, assets, and catalog freshness               |
| `pnpm test`             | Run progress and route-loader tests with Vitest                     |
| `pnpm test:e2e`         | Run browser behavior tests against a production build               |
| `pnpm knip`             | Find unused files, exports, and dependencies                        |
| `pnpm check`            | Validate data, formatting, lint, types, unused code, and unit tests |
| `pnpm check:fix`        | Fix lint/formatting; check types and unused code                    |
| `pnpm build`            | Check types and build for production                                |
| `pnpm preview`          | Preview the production build                                        |

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
Tooling includes the catalog generator and Playwright config. React Router loaders
may throw a native `Response` for route errors; the application ESLint configuration
allows this documented framework convention.

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
Style navigation links with shadcn's `buttonVariants`; Base UI `Button` is reserved
for actions so links retain their native keyboard behavior and accessible role.
The button primitive permits the generator's `buttonVariants` export alongside
the component in the React Refresh rule.

Vitest discovers `src/**/*.test.ts` and exercises persistence and loaders through
their module interfaces. Playwright covers direct links, immediate feedback,
explanations, retry/resume, category transitions, reset confirmation, data-load
recovery, unavailable storage, responsive layout, and system dark mode. Run it
after building:

```sh
pnpm build
pnpm test:e2e
```

Local browser tests use installed Google Chrome. CI installs Playwright Chromium.
Screenshots and failure traces are written to ignored `test-results` directories.
Set `PLAYWRIGHT_DEV=1` when running browser tests to use the Vite development
server instead of the production preview, including checks for Base UI warnings.

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
types, unused code/dependencies, source data/catalog validation, unit tests,
the production build, and Chromium browser tests in separate steps. Husky
hooks are disabled in CI.
Run the same checks locally with:

```sh
nix flake check --all-systems --no-update-lock-file
pnpm check
pnpm build
```

## GitHub Pages

The app is published at <https://lluchkaa.github.io/highway-code/>. GitHub Pages
uses GitHub Actions as its publishing source. The separate `pages` workflow in
`.github/workflows/pages.yml` starts after `quality` completes successfully on
`main`, for pushes and manual quality runs. It checks out the exact commit that
passed, builds the app, uploads `dist`, and deploys it. Pull requests and other
branches only run checks.

Vite uses `/highway-code/` as its base path for development, preview, and production.
Open the URL printed by `pnpm dev` or `pnpm preview`. Reference public assets in
application code through `import.meta.env.BASE_URL` so they resolve beneath this
path. If the repository name or hosting domain changes, update `base` in
`vite.config.ts` to match.
