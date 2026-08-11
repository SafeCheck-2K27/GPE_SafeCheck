<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Frontend project rules

Read `docs/frontend-architecture.md` before changing frontend structure, shared
UI, data ownership, URL state, providers, or tests. In particular:

- `src/components` must never import from `src/features`;
- keep route-only code in route-private `_components` and `_data.ts` files;
- reuse SafeCheck primitives and `AccessibleModal` before adding local copies;
- keep catalog data serializable and preserve one source of truth;
- do not describe mocked/local MVP behavior as backend-backed behavior.

Before handing off a change, run `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`, and `git diff --check`, then report any command not run.
