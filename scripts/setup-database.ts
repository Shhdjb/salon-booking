/**
 * Database setup script for SALON SHAHD
 * - Parses DATABASE_URL from .env
 * - Creates the database if it doesn't exist
 * - Handles PostgreSQL connection errors with clear messages
 */

import { config } from "dotenv";
import { Client } from "pg";
import { resolve } from "path";

// Load .env from project root
config({ path: resolve(process.cwd(), ".env") });

function parseDatabaseUrl(url: string): {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  connectionString: string;
} {
  try {
    const parsed = new URL(url);
    return {
      user: decodeURIComponent(parsed.username || "postgres"),
      password: decodeURIComponent(parsed.password || ""),
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "5432", 10),
      database: parsed.pathname?.slice(1)?.split("?")[0] || "postgres",
      connectionString: url,
    };
  } catch {
    throw new Error(
      'Invalid DATABASE_URL format. Expected: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public'
    );
  }
}

async function databaseExists(client: Client, dbName: string): Promise<boolean> {
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  return result.rows.length > 0;
}

async function createDatabase(client: Client, dbName: string): Promise<void> {
  await client.query(`CREATE DATABASE "${dbName}"`);
  console.log(`✓ Database "${dbName}" created.`);
}

export async function setupDatabase(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  const hasPlaceholders =
    !url ||
    url.includes("HOST") ||
    url.includes("/DATABASE") ||
    url.includes("YOUR_PASSWORD") ||
    url.includes("USER:PASSWORD");
  if (hasPlaceholders) {
    console.error(`
❌ DATABASE_URL is missing or contains placeholders.

Please update your .env file with a real PostgreSQL connection string:

  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/salon?schema=public"

Replace:
  - postgres     → your PostgreSQL username
  - YOUR_PASSWORD → your PostgreSQL password
  - salon        → database name (will be created if missing)
  - localhost    → use 127.0.0.1 if localhost fails
`);
    return false;
  }

  const { user, password, host, port, database, connectionString } = parseDatabaseUrl(url);

  if (!database || database === "postgres") {
    console.error(`
❌ DATABASE_URL must specify a database name other than "postgres".

Example: postgresql://postgres:password@localhost:5432/salon?schema=public
                                                          ^^^^^
`);
    return false;
  }

  // Connect to default "postgres" database to create our target database
  const adminClient = new Client({
    user,
    password,
    host,
    port,
    database: "postgres",
  });

  try {
    await adminClient.connect();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConnectionRefused = msg.includes("ECONNREFUSED") || msg.includes("connect");
    const isAuthError = msg.includes("password") || msg.includes("authentication");

    if (isConnectionRefused) {
      console.error(`
❌ Cannot connect to PostgreSQL at ${host}:${port}

PostgreSQL does not appear to be running or is not reachable.

What to do:
  1. Install PostgreSQL if not installed:
     - Windows: https://www.postgresql.org/download/windows/
     - macOS:   brew install postgresql@16
     - Linux:   sudo apt install postgresql (Ubuntu/Debian)

  2. Start PostgreSQL:
     - Windows (service): Start the "postgresql" service
     - macOS:   brew services start postgresql@16
     - Linux:   sudo systemctl start postgresql

  3. Verify it's running: psql -U postgres -h localhost -c "SELECT 1"
`);
    } else if (isAuthError) {
      console.error(`
❌ PostgreSQL authentication failed for user "${user}" at ${host}:${port}

Check your DATABASE_URL in .env:
  - Username and password must match your PostgreSQL setup
  - Default user is often "postgres"
`);
    } else {
      console.error(`❌ PostgreSQL connection error:`, msg);
    }
    return false;
  }

  try {
    const exists = await databaseExists(adminClient, database);
    if (!exists) {
      await createDatabase(adminClient, database);
    } else {
      console.log(`✓ Database "${database}" already exists.`);
    }
    return true;
  } catch (err: unknown) {
    console.error("❌ Error creating database:", err instanceof Error ? err.message : err);
    return false;
  } finally {
    await adminClient.end();
  }
}

// Run when executed directly (tsx scripts/setup-database.ts)
setupDatabase()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
