import "@dotenvx/dotenvx/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/dev", // Separate dev migrations
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});