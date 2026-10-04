export type Task = {
  name: string
  increment: number
  total: number
}

export type Streak = {
  cookie: number
  legs: number
  poop: number
}

export type User = {
  name: string
  tasks: Task[]
  reminders: string[]
  subscriptions: [],
}

export type TaskAction =
  | { type: 'complete_task'; name: string }
  | { type: 'add_task'; task: Task }
  | { type: 'delete_task'; increment: number; name: string }
