import { isToday } from 'date-fns'
import type { Log, Task } from '@/types/user'

// all of today's logs, or just one task's if a name is passed
export function todayLogs(logs: Log[], name?: string) {
  const today = logs.filter((log) => isToday(new Date(log.createdAt)))
  return name ? today.filter((log) => log.task === name) : today
}

// all-time total for one task → { task: 'kratom', total: 340 }
export function logTotal(logs: Log[], task: Task) {
  const total = logs
    .filter((log) => log.task === task.name)
    .reduce((sum, log) => sum + log.amount, 0)
  return { task: task.name, total }
}

// **this is the current days total, in live real time, different
// than the daily records stored in the db for each full day
// today's total for one task
export function todayTotal(logs: Log[], name: string) {
  return todayLogs(logs, name).reduce((total, log) => total + log.amount, 0)
}
