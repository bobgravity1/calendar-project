import { env } from "../data/env.ts";
import { relations } from "../relations.ts";
import { drizzle } from 'drizzle-orm/libsql';

const db = drizzle({
    relations,
    connection: {
        url: env.url,
        authToken: env.authToken
    }
});

export default db;
