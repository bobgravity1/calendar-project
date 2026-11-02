import type { Task } from '@/types/user'

export async function getAllTasks() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/task`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok)
      throw new Error(`response unsuccessful: ${response.status}`)
    const { tasks } = await response.json()
    return tasks
  } catch (err) {
    throw new Error(`no tasks found in DB: ${err}`)
  }
}

export const insertDBTask = async (task: Task) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/task/create-task`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task }),
      },
    )
    if (!response.ok)
      throw new Error(`failed to create task ${task.name}: ${response.status}`)
    const { newTask } = await response.json()
    console.log(`task: ${newTask.name} created`)
    return newTask
  } catch (err) {
    throw new Error(`task ${task.name} not created`, { cause: err })
  }
}

export const deleteDBTask = async (task: Task) => {
  const { name } = task
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/task/delete-task/${name}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    if (!response.ok)
      throw new Error(`failed to delete task ${name}: ${response.status}`)
    // server sends { taskName: { deletedId: <name> } } — see server/routes/task.ts:39
    const { taskName } = await response.json()
    console.log(`task: ${taskName.deletedId} deleted`)
  } catch (err) {
    throw new Error(`task ${name} not deleted`, { cause: err })
  }
}
