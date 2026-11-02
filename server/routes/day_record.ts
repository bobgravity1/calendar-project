import { sValidator } from '@hono/standard-validator'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import { Hono } from 'hono'
import db from '../db/db.ts'
import { dayRecordTable, recordLogSchema } from '../db/schemas/day_record.ts'
import { format, formatDistance, sub } from 'date-fns'

export const dailyRecord = new Hono()

// A useful mental model is: validate first,
//  calculate second, query third. Once you’ve
// established that the date is valid and the type
// is supported, the rest of the handler can proceed
// without repeatedly checking whether those values exist.
// NOTE FOR WHEN I RETURN. THE CONSTANT CHECKS HERE CAN BE SWEEPED EARLY ON. FIX THIS UP
dailyRecord.get('/:type', async (c) => {
  const type_request = c.req.param('type')
  const start_request = c.req.query('start')

  const start_date = start_request ? new Date(start_request) : undefined

  let date_span
  if (start_date && type_request === 'week') {
    date_span = sub(start_date, {
      weeks: 1,
    })
  }
  if (start_date && type_request === 'month') {
    date_span = sub(start_date, {
      months: 1,
    })
  }

  const recordsInFullRange =
    date_span && start_date
      ? await db
          .select()
          .from(dayRecordTable)
          .where(
            and(
              gte(dayRecordTable.createdAt, date_span),
              lte(dayRecordTable.createdAt, start_date),
            ),
          )
      : null

  return c.json({ recordsInFullRange }, 200)
})

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
