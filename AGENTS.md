# Codebase rules

Use the commands and conventions in [README.md](README.md). The executable rules
live in `eslint.config.js`, the TypeScript configs, `prettier.config.js`, and
`knip.json`; update the README when changing them.

- Run `pnpm check` and `pnpm build` before finishing changes. Format and check
  question JSON alongside the rest of the project.
- Use `@/` for application imports. Keep side-effect imports in their intentional
  execution order; ESLint fixes other import ordering and named-member sorting.
- Shared UI primitives live in `src/components/uikit`; stores live in `src/stores`.
  Keep their dependency direction enforced by ESLint. Add restrictions for new
  feature modules only when their responsibilities and dependencies are concrete.
- Preserve the shadcn generator settings in `components.json`. Import `cn` directly
  from its package. Add dependencies when code actually uses them; keep Knip free
  of speculative entry points and unused-dependency exceptions.
- Exercise behavior through the module interface when adding tests. Avoid
  extracting modules or introducing adapters solely to satisfy a lint rule.
