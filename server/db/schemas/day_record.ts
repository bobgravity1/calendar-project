// import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-orm/zod'
import { taskTable } from './task.ts'
import { z } from 'zod'

export const dayRecordTable = sqliteTable(
  'day_record',
  {
    task: text()
      .notNull()
      .references(() => taskTable.name, {
        onUpdate: 'cascade',
      }),
    id: integer().primaryKey({ autoIncrement: true }),
    total: integer().notNull(),
    date: integer({ mode: 'timestamp' }).notNull(),
    createdAt: integer({ mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.task, t.date)],
  //   composite unique constraint:
  //   all record logs must have a unique task name and date (ie. only one 'water' record allowed for June 5th, since this is a daily record)
)

export const recordLogSchema = createInsertSchema(dayRecordTable, {
  // here we need to convert the string date that comes in from the frontend
  // (because of json.stringify) to a proper Date format
  date: z.string().pipe(z.coerce.date()),
}).pick({ task: true, total: true, date: true })
