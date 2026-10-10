export type Task = {
  name: string
  increment: number
  total: number
  unit: string
}

export type Reminder = {
  name: string,
  time: Date,
  location: string
}

export type User = {
  name: string
  tasks: Task[]
  reminders: Reminder[]
}

export type TaskAction =
  | { type: 'complete_task'; task: Task }
  | { type: 'add_task'; task: Task }
  | { type: 'delete_task'; task: Task }
  | { type: 'edit_task', task: Task }
