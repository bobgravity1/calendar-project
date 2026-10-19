import { isToday } from 'date-fns'
import type { Task } from '@/types/user'

export async function createDBLog(task: Task) {
  const { increment, name } = task
  let data
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/log/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: increment, task: name }),
      },
    )
    // Once you do .then(res => res.json()), you’ve passed along
    // the body and lost that response object. Your body doesn’t
    // contain an ok property.

    if (!response.ok) throw new Error(`Log Failed: ${response.status}`)
    data = await response.json()
  } catch (err) {
    throw new Error(`log not created: ${err}`)
  }
  console.log(data)
}

export async function getAllDBLogs() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/log`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`failed to get logs: ${response.status}`)
  const { logs } = await response.json()

  const fullLogObject = logs.reduce(
    (groups: { [x: string]: any[] }, log: { [x: string]: any }) => {
      const name: string = log['task']
      if (groups[name] === undefined) {
        groups[name] = []
      }
      groups[name].push(log)
      return groups
    },
    {},
  )
  // { kratom: [...logs], leg: [...logs] }
  return fullLogObject
}

export async function hasDayPassed() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/log/latest`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    if (!response.ok)
      throw new Error(`failed to get latest task ${response.status}`)

    const body = await response.json()
    if (body === null) return { refresh: false, record: null }

    const {
      latestLog: { createdAt },
    } = body

    // if the date the db log was created is yesterday,
    // then we need to send a response of refresh: true
    // this is so our totals can be reset and act accordingly
    if (!isToday(new Date(createdAt))) {
      const allLogs = await getAllDBLogs()
      // REMAINING TO DO: The function now works with one caveat: it totals all logs ever, not just the previous day's. That's the last open question before record means what you want.

      // { kratom: [...logs], leg: [...logs] } => [ { task: 'kratom', total: 300 }, { task: 'leg', total: 17 } ]
      const totals = Object.entries(allLogs).map(([task_name, logs]: any) => {
        const totalAmount = logs.reduce(
          (total: number, log: { task: string; amount: number }) =>
            total + log.amount,
          0,
        )
        return { task: task_name, total: totalAmount }
      })

      return { refresh: true, record: totals }
    } else {
      return { refresh: false, record: null }
    }
  } catch (err) {
    throw new Error('day check failed', { cause: err })
  }
}

export async function getDBTodayLogs() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/log`, {
    method: 'GET',
    headers: { 'Content-Type': 'Application/json' },
  })

  if (!response.ok) throw new Error(`bad response:${response.ok}`)
  const body = await response.json()
  console.log(body.logs)

  let todayLogs = []

  const finalLogs = body.logs?.filter(
    (log: { createdAt: string; task: string; log_id: number }) =>
      isToday(new Date(log.createdAt)) && log,
  )
  console.log(finalLogs)
  return finalLogs
}
