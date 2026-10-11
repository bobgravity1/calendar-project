import { defineConfig } from "drizzle-kit";
import { env } from "./server/data/env.ts";

export default defineConfig({
    schema: "./server/schemas.ts",
    out: "./drizzle",
    dialect: "turso",
    strict: true,
    verbose: true,
    dbCredentials: {
        url: env.url,
        authToken: env.authToken
    }
});
