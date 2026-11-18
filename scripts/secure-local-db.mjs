import { randomBytes } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { parse } from "dotenv"

// Local Docker development only. No migrations, volume removal or data changes.
const root = fileURLToPath(new URL("../", import.meta.url))
const envPath = fileURLToPath(new URL("../.env", import.meta.url))

function docker(args, env, input) {
  const result = spawnSync("docker", args, {
    cwd: root,
    env: { ...process.env, ...env },
    input,
    encoding: "utf8",
    windowsHide: true,
  })
  if (result.error || result.status !== 0) {
    // SQL and environment may contain credentials: never print them or stderr.
    throw new Error(`Docker step failed (${args.slice(0, 2).join(" ")}). Check Docker Desktop and the local PostgreSQL service, then rerun npm run db:secure.`)
  }
  return result.stdout.trim()
}

function identifier(value, label) {
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(value)) {
    throw new Error(`${label} must be a lowercase PostgreSQL identifier`)
  }
  return value
}

function password(value) {
  // Hex keeps both Compose URL interpolation and dotenv parsing unambiguous.
  return /^[a-f0-9]{64,128}$/i.test(value ?? "") ? value : randomBytes(32).toString("hex")
}

try {
  let source
  try {
    source = readFileSync(envPath, "utf8")
  } catch (error) {
    if (error.code !== "ENOENT") throw error
    source = readFileSync(new URL("../.env.example", import.meta.url), "utf8")
  }
  const env = parse(source)
  const admin = identifier(env.POSTGRES_USER || "safecheck", "POSTGRES_USER")
  const app = identifier(env.APP_DB_USER || "safecheck_app", "APP_DB_USER")
  const db = identifier(env.POSTGRES_DB || "safecheck", "POSTGRES_DB")
  if (admin === app) throw new Error("Application and administration roles must be different")
  const port = Number(env.POSTGRES_PORT || "5432")
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid POSTGRES_PORT")
  if (env.DATABASE_URL) {
    const current = new URL(env.DATABASE_URL)
    if (!["localhost", "127.0.0.1", "[::1]"].includes(current.hostname) || current.pathname !== `/${db}`) {
      throw new Error("db:secure only manages the configured local Docker database; DATABASE_URL points elsewhere")
    }
  }

  // Check Docker before changing the ignored local environment file.
  docker(["info", "--format", "{{.ServerVersion}}"], env)
  const configured = {
    ...env,
    POSTGRES_USER: admin,
    POSTGRES_PASSWORD: password(env.POSTGRES_PASSWORD),
    POSTGRES_DB: db,
    POSTGRES_PORT: String(port),
    APP_DB_USER: app,
    APP_DB_PASSWORD: password(env.APP_DB_PASSWORD),
  }
  if (configured.APP_DB_PASSWORD === configured.POSTGRES_PASSWORD) {
    configured.APP_DB_PASSWORD = randomBytes(32).toString("hex")
  }
  configured.DATABASE_URL = `postgresql://${app}:${configured.APP_DB_PASSWORD}@127.0.0.1:${port}/${db}?schema=public`
  configured.MIGRATION_DATABASE_URL = `postgresql://${admin}:${configured.POSTGRES_PASSWORD}@127.0.0.1:${port}/${db}?schema=public`
  for (const key of ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "POSTGRES_PORT", "APP_DB_USER", "APP_DB_PASSWORD", "DATABASE_URL", "MIGRATION_DATABASE_URL"]) {
    const line = `${key}="${configured[key]}"`
    const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, "gm")
    source = pattern.test(source) ? source.replace(pattern, line) : `${source.trimEnd()}\n${line}\n`
  }
  // Save first: a failed Docker step can be retried using the same credentials.
  writeFileSync(envPath, source, { mode: 0o600 })
  docker(["compose", "up", "-d", "--no-deps", "--wait", "--wait-timeout", "90", "postgres"], configured)

  // The official image permits local socket administration. This also rotates
  // credentials on an existing volume; POSTGRES_PASSWORD alone does not do so.
  // The input is sent over stdin, never as command-line arguments.
  const sql = `
BEGIN;
SET LOCAL log_statement = 'none';
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${app}') THEN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relowner = (SELECT oid FROM pg_roles WHERE rolname = '${app}'))
       OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner = (SELECT oid FROM pg_roles WHERE rolname = '${app}'))
       OR EXISTS (SELECT 1 FROM pg_database WHERE datdba = (SELECT oid FROM pg_roles WHERE rolname = '${app}')) THEN
      RAISE EXCEPTION 'Application role already owns database objects; inspect ownership manually';
    END IF;
  ELSE
    CREATE ROLE "${app}";
  END IF;
END $$;
ALTER ROLE "${admin}" PASSWORD '${configured.POSTGRES_PASSWORD}';
ALTER ROLE "${app}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT PASSWORD '${configured.APP_DB_PASSWORD}';
DO $$ DECLARE parent record; BEGIN
  FOR parent IN SELECT r.rolname FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles a ON a.oid = m.member WHERE a.rolname = '${app}' LOOP
    EXECUTE format('REVOKE %I FROM %I', parent.rolname, '${app}');
  END LOOP;
END $$;
REVOKE CREATE, TEMPORARY ON DATABASE "${db}" FROM PUBLIC;
REVOKE ALL ON DATABASE "${db}" FROM "${app}";
GRANT CONNECT ON DATABASE "${db}" TO "${app}";
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM "${app}";
GRANT USAGE ON SCHEMA public TO "${app}";
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "${app}";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${app}";
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM "${app}";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${app}";
ALTER DEFAULT PRIVILEGES FOR ROLE "${admin}" IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${app}";
ALTER DEFAULT PRIVILEGES FOR ROLE "${admin}" IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${app}";
DO $$ BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM "${app}";
  END IF;
END $$;
COMMIT;
`
  docker(["compose", "exec", "-T", "postgres", "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-U", admin, "-d", db], configured, sql)
  console.log("Local PostgreSQL secured: 127.0.0.1 only, separate credentials, restricted application role. Existing data preserved.")
  console.log("Restart any running API/frontend processes to reload .env. No migrations were run.")
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
