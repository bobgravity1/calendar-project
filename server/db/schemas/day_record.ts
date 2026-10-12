// import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-orm/zod";
import { taskTable } from "./task.ts";

export const dayRecordTable = sqliteTable("day_record", {
    task: text().notNull().references(() => taskTable.name, {
        onUpdate: "cascade"
    }),
    id: integer().primaryKey({ autoIncrement: true }),
    total: integer().notNull(),
    date: integer({ mode: "timestamp" }).notNull(),
    createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})

export const recordLogSchema = createInsertSchema(dayRecordTable).pick({
    task: true, total: true, date: true
})