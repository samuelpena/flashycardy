//This is useful for when it's integrated into a CI/CD pipleine and want to 
// programmatically migrate everytime it runs.  
// It's not necessary for local development.

import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./index";

async function runMigrations() {
  const migrationsPath = process.env.NODE_ENV === "production" 
    ? "./drizzle/prod" 
    : "./drizzle/dev";

  console.log(`Running Neon migrations from: ${migrationsPath}`);

  try {
    // Programmatically apply schema changes
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("✅ Neon migrations applied successfully");
  } catch (error) {
    console.error("❌ Neon migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
