// import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-orm/zod";

export const taskTable = sqliteTable("task", {
    name: text().notNull().unique(),
    unit: text().notNull(),
    increment: integer().notNull(),
    id: integer().primaryKey({ autoIncrement: true }),
    // built in function for onUpdate. There is also an $onCreateFn
    updatedAt: integer({ mode: "timestamp" }).notNull().$onUpdateFn(() => new Date())
})

// Generates our zod schemas automatically for hono to check against the server request
export const newTaskSchema = createInsertSchema(taskTable).omit({
    updatedAt: true, id: true
});
