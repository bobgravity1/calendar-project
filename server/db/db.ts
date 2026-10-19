import { drizzle } from 'drizzle-orm/libsql';
import { env } from "../data/env.ts";
import { relations } from "../relations.ts";

const db = drizzle({
    relations,
    connection: {
        url: env.url,
        authToken: env.authToken
    }
});

export default db;
