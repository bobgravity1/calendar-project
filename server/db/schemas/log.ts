// import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-orm/zod'
import { taskTable } from './task.ts'

export const logTable = sqliteTable('log', {
  task: text()
    .notNull()
    .references(() => taskTable.name, {
      //  “If I rename this task, its logs should follow the new name.”
      //   this is the cascade relationship for one to many for deleting
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  amount: integer().notNull(),
  log_id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const newLogSchema = createInsertSchema(logTable).pick({
  task: true,
  amount: true,
})
