import { Hono } from 'hono'
import logApp from './routes/log.ts'
import taskApp from './routes/task.ts'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { desc } from 'drizzle-orm'
import { logTable, newLogSchema } from './db/schemas/log.ts'
import { taskTable, newTaskSchema } from './db/schemas/task.ts'
import db from './db/db.ts'

const app = new Hono()
// built in middleware for logging server side routines
// It prints the incoming method and path, lets the route run, 
// then prints the response status and elapsed time
// <-- GET /api/task
// --> GET /api/task 200 2ms
app.use(logger())

app.use('/api/*', cors({
    origin: (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ? origin : undefined
}))

app.route('/api/log', logApp)
app.route('/api/task', taskApp)

app.get('/', (c) => c.text('Hono!'))

export default {
    fetch: app.fetch,
    port: 3000
}
