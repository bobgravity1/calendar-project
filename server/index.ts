import { Hono } from 'hono'
import logApp from './routes/log.ts'
import taskApp from './routes/task.ts'
import { cors } from 'hono/cors'

const app = new Hono()

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
