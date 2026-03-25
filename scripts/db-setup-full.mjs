#!/usr/bin/env node
/**
 * Full database setup: create DB (if needed) -> generate -> migrate -> seed
 * Run: node scripts/db-setup-full.mjs
 * Or:  npm run db:setup
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd, args, description) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${description} failed with code ${code}`));
    });
    proc.on("error", reject);
  });
}

async function main() {
  console.log("\n📦 SALON SHAHD - Database Setup\n");

  // Step 1: Create database if missing
  console.log("1. Ensuring database exists...");
  const step1 = spawn("npx", ["tsx", "scripts/setup-database.ts"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  const step1Ok = await new Promise((resolve) => {
    step1.on("close", (code) => resolve(code === 0));
  });
  if (!step1Ok) {
    console.error("\nFix the issues above, then run: npm run db:setup");
    process.exit(1);
  }

  // Step 2: Prisma generate
  console.log("\n2. Generating Prisma client...");
  await run("npx", ["prisma", "generate"], "prisma generate");

  // Step 3: Prisma migrate
  console.log("\n3. Running migrations...");
  await run("npx", ["prisma", "migrate", "dev", "--name", "init"], "prisma migrate");

  // Step 4: Seed
  console.log("\n4. Seeding initial data...");
  await run("npx", ["tsx", "prisma/seed.ts"], "seed");

  console.log("\n✅ Database setup complete!\n");
  console.log("  Admin login: admin@salonshahd.com / admin123");
  console.log("  Run: npm run dev\n");
}

main().catch((e) => {
  console.error("\n❌ Setup failed:", e.message);
  process.exit(1);
});
