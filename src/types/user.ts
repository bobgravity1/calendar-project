export type Task = {
  name: string
  increment: number
  total: number
  unit: string
}

export type Log = {
  task: string
  amount: number
  log_id: number
  createdAt: string
}

export type Record = {
  task: string
  total: number
  date: string
  //   ^date meaning the date of the record, ***not the createdAt date***
}

export type Reminder = {
  name: string
  time: Date
  location: string
}

export type User = {
  name: string
  tasks: Task[]
  logs: Log[]
  reminders: Reminder[]
  records: Record[]
}

export type TaskAction =
  | { type: 'complete_task'; task: Task }
  | { type: 'add_task'; task: Task }
  | { type: 'delete_task'; task: Task }
  | { type: 'edit_task'; task: Task }
  | { type: 'add_log'; log: Log }
