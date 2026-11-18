# QUALITY FAMILY F — Database integrity review

Date: 2026-10-05. Repository: `GPE_SafeCheck_PUSH`.

## Review scope and recommendation

This is a read-only review of the Prisma schema, the five SQL migrations, Better Auth configuration, and Audit/tutorial persistence paths. The proposed Family F migration is appropriate as one additive migration: add `Audit.questionnaireVersion` and `Audit.scoringVersion` (`INTEGER NOT NULL DEFAULT 1`), add `UserTutorialProgress.tutorialVersion` (`INTEGER NOT NULL DEFAULT 1`), then add SQL `CHECK` constraints for ownership and stable numeric invariants. Do not rewrite already-applied migration files.

The checked local baseline reported by the parent is consistent with the proposed checks: 11 audits, 73 answers, 4 tutorial-progress rows; no ownership XOR violations, negative/null values, invalid array elements, or invalid IDs. Five migrations are applied. Preserve this as one environment's evidence only; it does not establish the state of older or deployed databases.

## Constraint matrix

| Table / column | Recommended database invariant | Avoid coupling to |
|---|---|---|
| `audits.userId`, `audits.guestSubject` | Exactly one owner is present: `(userId IS NOT NULL) <> (guestSubject IS NOT NULL)`. Existing guest creation and account claim paths produce one owner; `claimGuestAudits` changes the pair together. | Whether an owner identifier is a particular UUID/string format; those are application/auth concerns. |
| `audits.questionnaireVersion`, `audits.scoringVersion` | Both `NOT NULL DEFAULT 1 CHECK (> 0)`. This prevents nonpositive versions. Unknown positive versions remain valid historical metadata and must be rejected explicitly by the application before interpretation. | Current maximum version, current question count, or current scoring implementation. Versions are durable historical identifiers. |
| `audit_answers.questionId` | `CHECK (questionId > 0)`. It is a stable domain fact; the `(auditId, questionId)` primary key already prevents duplicates per audit. | Membership in today's question catalog. Route validation does this at `server/audits/routes.ts`; a catalog-membership DB check would make historical answers/migrations depend on mutable content. |
| `user_tutorial_progress.tutorialId` | `CHECK (tutorialId > 0)`. | Membership in today's static tutorial catalog. The route resolves the ID against that catalog before saving. |
| `user_tutorial_progress.tutorialVersion` | `NOT NULL DEFAULT 1 CHECK (> 0)`. It identifies which content version the saved indices describe. | Current catalog maximum/version set. |
| `user_tutorial_progress.currentStep` | Existing `NOT NULL DEFAULT 0`, plus `CHECK (currentStep >= 0)`. | A current catalog upper bound. Tutorial lengths can change and are already validated by the API. |
| `user_tutorial_progress.completedSteps` | Make `NOT NULL DEFAULT ARRAY[]::INTEGER[]`; require each stored step to be nonnegative and reject null elements. `0 <= ALL(completedSteps)` alone is insufficient because PostgreSQL CHECK accepts UNKNOWN and `ALL` can yield UNKNOWN for an array containing NULL. Pair the nonnegative check with `array_position(completedSteps, NULL) IS NULL` (and confirm one-dimensional arrays if that is part of the chosen SQL contract). | Current tutorial length, sorting, uniqueness, or membership of array values in a catalog. The API normalizes and bounds values; these would make persistence depend on current content. Avoid constraining PostgreSQL array lower bounds as if they were step values. |

The baseline's answer values `a`–`d` and question IDs `1`–`10` support positive-ID checks. Keep option membership in application validation: values are the vocabulary of a versioned catalog and can evolve. The positive-ID SQL check protects direct writes without freezing that vocabulary.

## Migration and backfill order

Use a single new migration after the current five. Add version columns with a non-null default of `1` so existing rows backfill deterministically. Before adding each `CHECK`, run a read-only violation query on the target database (counts and offending keys, not only local data). Add constraints only after remediation is understood. Keep the `Audit` FK `ON DELETE RESTRICT`: there is no intentional account-delete feature, and cascading account deletion would erase retained audit history. The existing tutorial progress FK may keep `ON DELETE CASCADE`, since that data belongs to the account and is not audit history.

Do not add indexes speculatively. `audits.userId` already has an index and `listUserAudits` filters by it then orders by `createdAt DESC, id DESC`; retain the current index for this MVP. The tutorial-progress composite primary key `(userId, tutorialId)` begins with `userId` and covers the actual per-user filter. Its ordering by `updatedAt DESC, tutorialId ASC` can sort the matching rows, but the known dataset is tiny; do not add a second index without measured history volume/query latency. No current query justifies a standalone `tutorialId` index.

## Better Auth migration preflight for older databases

`prisma/migrations/20260928185518_add_better_auth_core/migration.sql` changes `users.name` to `NOT NULL` and records only a local precondition (“public.users contained 0 rows”). `server/auth/auth.ts` uses the Prisma adapter with `user.modelName = "User"`, and `prisma/schema.prisma` declares `User.name` required. Before deploying Better Auth to an older database, establish whether the migration is applied and whether any `name` values are NULL. Do not infer an empty database from the local check. The following SQL is read-only and tolerates a missing table/Prisma migration ledger; run it before the Better Auth migration on old environments:

```sql
SELECT
  to_regclass('public.users') AS users_table,
  to_regclass('public._prisma_migrations') AS migration_ledger;

SELECT table_name, column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', '_prisma_migrations')
  AND column_name IN ('name', 'migration_name');

DO $$
DECLARE
  null_names bigint;
  has_name boolean;
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE NOTICE 'public.users is absent; this database has no user rows to preflight';
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
    ) INTO has_name;
    IF NOT has_name THEN
      RAISE NOTICE 'public.users.name is absent; inspect schema lineage before Better Auth';
    ELSE
      EXECUTE 'SELECT count(*) FROM public.users WHERE name IS NULL' INTO null_names;
      RAISE NOTICE 'public.users rows with NULL name: %', null_names;
    END IF;
  END IF;

  IF to_regclass('public._prisma_migrations') IS NULL THEN
    RAISE NOTICE 'Prisma migration ledger is absent; use the schema inspection above and normal migration bootstrap';
  ELSE
    RAISE NOTICE 'Prisma ledger exists; query it for the Better Auth migration below';
  END IF;
END $$;
```

Only when `to_regclass('public._prisma_migrations')` is non-NULL, run:

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM public._prisma_migrations
WHERE migration_name = '20260928185518_add_better_auth_core';
```

If `users.name` exists and NULL rows are present while the migration is unapplied, stop the rollout and choose an explicit data repair or a forward-only schema plan before Better Auth; do not silently invent names. If the migration is already recorded as applied, verify the column is actually `NOT NULL` and investigate migration drift rather than replaying the historical SQL. Empty strings are distinct from NULL and should be reviewed as profile quality, not mistaken for a NOT NULL violation.

## Review findings by severity

- **P1 rollout risk:** Better Auth's historical `SET NOT NULL` can fail on an older populated database. Its migration comment documents only the empty local database; the guarded preflight above is required before rollout. Keep migration history immutable.
- **P2 integrity gap:** positive IDs, positive versions, nonnegative progress and Audit owner XOR are not expressible in Prisma schema alone. Encode them in SQL `CHECK`s in the new migration and keep matching comments in the Prisma schema.
- **P2 history interpretation:** version columns defaulting to 1 are necessary so existing audits and progress rows have an explicit interpretation. Do not auto-derive old rows from today's catalog.
- **P3 index restraint:** existing ownership and composite-PK indexes serve current access paths. No measured evidence supports an additional history/progress index at the current MVP scale.
- **Intentional retention:** `Audit.user` uses `ON DELETE RESTRICT` in the schema and migration. Preserve that behavior because no delete-account feature is specified and audit records are retained history.

## Source references

- `prisma/schema.prisma:14-43,92-120` — User, tutorial progress, Audit ownership/indexes, and answer composite key.
- `prisma/migrations/20260928185518_add_better_auth_core/migration.sql:1-11` — historical name requirement and local-only precondition.
- `prisma/migrations/20260928205533_audit_user_ownership/migration.sql:2-12` — nullable guest/user owner fields, current indexes, and RESTRICT FK.
- `prisma/migrations/20261002180303_add_user_tutorial_progress/migration.sql:1-14` — existing progress table and composite PK.
- `server/auth/auth.ts:1-18` — Better Auth Prisma adapter and model mapping.
- `server/audits/routes.ts:27,182-207` and `server/audits/service.ts:36-44,47-54,58-83` — catalog validation, ownership filters, history query, claim flow and answer upsert.
- `server/tutorial-progress/routes.ts:13-55` and `server/tutorial-progress/service.ts:12-30` — catalog and payload validation, per-user reads and upsert key.
