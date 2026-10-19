import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import logApp from './routes/log.ts'
import taskApp from './routes/task.ts'

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
