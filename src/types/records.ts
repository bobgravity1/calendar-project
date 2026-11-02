import type { Task } from './user'

export type Record = {
  task: string
  total: number
  date: string
  //   ^date meaning the date of the record, ***not the createdAt date***
}
