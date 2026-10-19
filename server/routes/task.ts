import { sValidator } from "@hono/standard-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import db from '../db/db.ts'
import { newTaskSchema, taskTable } from "../db/schemas/task.ts";

const taskApp = new Hono();

taskApp.get('/', async (c) => {
    const tasks = await db.query.task.findMany()
    if (!tasks) return c.json({ err: `task not found` }, 400)

    return c.json({ tasks }, 200)
})

taskApp.get('/task/:name', async (c) => {
    const taskName = c.req.param("name");
    const taskMatch = await db.query.task.findFirst({
        where: {
            name: taskName
        }
    })
    if (!taskMatch) return c.json({ message: `task name: ${taskName} not found` }, 400)
    return c.json({ taskMatch }, 200)
})

taskApp.post('/create-task', sValidator("json", newTaskSchema), async (c) => {
    const valid = c.req.valid("json");

    if (!valid) return c.json({ error: `invalid json` }, 400);
    const [newTask] = await db.insert(taskTable).values({ ...valid }).returning()
    return c.json({ newTask }, 201)
})

taskApp.delete('/delete-task/:name', async (c) => {
    const submittedName = await c.req.param("name")

    if (!submittedName) return c.json({ error: `no name found` }, 400);
    const [taskName] = await db.delete(taskTable).where(eq(taskTable.name, submittedName)).returning({ deletedId: taskTable.name });
    return c.json({ taskName }, 201)
})

export default taskApp;