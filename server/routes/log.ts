import { sValidator } from "@hono/standard-validator";
import { desc } from "drizzle-orm";
import { Hono } from "hono";
import db from "../db/db.ts";
import { logTable, newLogSchema } from '../db/schemas/log.ts'

const logApp = new Hono();

logApp.get('/', async (c) => {
    const logs = await db.query.log.findMany()

    if (!logs) return c.json({ error: 'no match found' }, 400)
    return c.json({ logs }, 200)
})

logApp.post('/create', sValidator("json", newLogSchema), async (c) => {
    const submission = await c.req.valid("json");

    if (!submission) return c.json({ error: 'bad match' }, 400)
    const [newLog] = await db.insert(logTable).values(submission).returning();
    return c.json({ newLog }, 200)
})

logApp.get('/latest', async c => {
    const [latestLog] = await db.select().from(logTable)
        .orderBy(desc(logTable.createdAt), desc(logTable.log_id))
        .limit(1);
    if (!latestLog) return c.json(null, 200)

    return c.json({ latestLog }, 200)
})


export default logApp;