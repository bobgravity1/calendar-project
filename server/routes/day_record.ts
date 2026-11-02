import { sValidator } from '@hono/standard-validator'
import { desc, eq, and } from 'drizzle-orm'
import { Hono } from 'hono'
import db from '../db/db.ts'
import { dayRecordTable, recordLogSchema } from '../db/schemas/day_record.ts'

export const dailyRecord = new Hono()

dailyRecord.get('/', async (c) => {
  const records = await db.query.record.findMany({
    with: { taskDetails: true },
  })

  if (records.length === 0)
    return c.json({ error: 'no daily records yet' }, 400)

  return c.json({ records }, 200)
})

dailyRecord.get('/:name', async (c) => {
  const task_name = c.req.param('name')
  const date_string = c.req.query('date')

  let records
  if (date_string) {
    const date = new Date(date_string)
    records = await db
      .select()
      .from(dayRecordTable)
      .where(
        and(eq(dayRecordTable.task, task_name), eq(dayRecordTable.date, date)),
      )
  } else {
    records = await db
      .select()
      .from(dayRecordTable)
      .where(and(eq(dayRecordTable.task, task_name)))
  }

  if (!records || records.length === 0) return c.json(null, 400)

  return c.json({ records }, 200)
})

// use the lt and gt for a range of dates from a date!

dailyRecord.post('/add', sValidator('json', recordLogSchema), async (c) => {
  const record = c.req.valid('json')

  if (!record) throw new Error(`request shape not valid`)

  const [newRecord] = await db
    .insert(dayRecordTable)
    .values({ ...record })
    .returning()

  return c.json({ newRecord }, 201)
})
