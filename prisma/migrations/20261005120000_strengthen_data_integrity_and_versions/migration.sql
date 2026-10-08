-- Version 1 denotes the question/scoring definitions and per-tutorial step order
-- used by all existing rows at this checkpoint. No answers or step indices change.
-- CHECK constraints and completedSteps NOT NULL are intentionally maintained in
-- SQL: Prisma's scalar-list DSL does not express these PostgreSQL safeguards.
BEGIN;
SET LOCAL lock_timeout = '10s';

-- Prevent concurrent writes between preflight and enforcement. This checkpoint
-- touches three small MVP tables; a busy environment should retry in a quiet window.
LOCK TABLE "audits", "audit_answers", "user_tutorial_progress" IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "audits" WHERE
        ("userId" IS NULL) = ("guestSubject" IS NULL)) THEN
        RAISE EXCEPTION 'Family F preflight: invalid Audit ownership; inspect owners before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM "audit_answers" WHERE "questionId" <= 0) THEN
        RAISE EXCEPTION 'Family F preflight: nonpositive questionId; inspect answers before migration';
    END IF;
    IF EXISTS (SELECT 1 FROM "user_tutorial_progress" WHERE
        "tutorialId" <= 0 OR "currentStep" < 0 OR "completedSteps" IS NULL OR
        NOT CASE
            WHEN cardinality("completedSteps") = 0 THEN true
            WHEN array_ndims("completedSteps") <> 1 THEN false
            ELSE array_lower("completedSteps", 1) = 1
                AND array_position("completedSteps", NULL) IS NULL
                AND 0 <= ALL("completedSteps")
        END) THEN
        RAISE EXCEPTION 'Family F preflight: invalid tutorial indices; inspect progress before migration';
    END IF;
END $$;

-- Constant defaults backfill existing rows without changing their timestamps.
ALTER TABLE "audits"
    ADD COLUMN "questionnaireVersion" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "scoringVersion" INTEGER NOT NULL DEFAULT 1,
    ADD CONSTRAINT "audits_owner_xor_check" CHECK (
        ("userId" IS NOT NULL AND "guestSubject" IS NULL) OR
        ("userId" IS NULL AND "guestSubject" IS NOT NULL)),
    ADD CONSTRAINT "audits_questionnaire_version_positive_check" CHECK ("questionnaireVersion" > 0),
    ADD CONSTRAINT "audits_scoring_version_positive_check" CHECK ("scoringVersion" > 0);

ALTER TABLE "audit_answers"
    ADD CONSTRAINT "audit_answers_question_id_positive_check" CHECK ("questionId" > 0);

ALTER TABLE "user_tutorial_progress"
    ADD COLUMN "tutorialVersion" INTEGER NOT NULL DEFAULT 1,
    ALTER COLUMN "completedSteps" SET NOT NULL,
    ADD CONSTRAINT "tutorial_progress_id_positive_check" CHECK ("tutorialId" > 0),
    ADD CONSTRAINT "tutorial_progress_version_positive_check" CHECK ("tutorialVersion" > 0),
    ADD CONSTRAINT "tutorial_progress_current_step_nonnegative_check" CHECK ("currentStep" >= 0),
    ADD CONSTRAINT "tutorial_progress_completed_steps_valid_check" CHECK (
        CASE
            WHEN cardinality("completedSteps") = 0 THEN true
            WHEN array_ndims("completedSteps") <> 1 THEN false
            ELSE array_lower("completedSteps", 1) = 1
                AND array_position("completedSteps", NULL) IS NULL
                AND 0 <= ALL("completedSteps")
        END);

COMMIT;
