import { Calendar } from './components/ui/calendar/calendar'
import { Button } from './components/ui/button'
import { RainbowButton } from "./components/ui/rainbow-button"
import { Container } from './components/container/container'
import { useReducer } from 'react'
import type { Task, TaskAction, User } from './types/tasks'

import bgImage from './assets/background/gradient.webp'

const user: User = {
  name: 'Bobby',
  tasks: [
    { name: 'cookie', increment: 20, total: 0 },
    { name: 'leg excercises', increment: 1, total: 0 },
    { name: 'poop', increment: 1, total: 0 }
  ],
  streak: { cookie: 0, legs: 0, poop: 0 }
}

function App() {
  const [tasks, dispatch] = useReducer(setTasks, user.tasks);

  function setTasks(tasks: Task[], action: TaskAction) {
    switch (action.type) {
      case "completed_task": {
        return tasks.map((task: Task) => action.name === task.name ? { ...task, total: task.total + task.increment } : task)
      }
      case "add_task": {
        // includes would only work for partial match. that would still pass.
        const match = tasks.some(task => task.name === action.task.name)
        if (match) {
          return tasks
        }
        // immutable state with passing, we still need to return the full state, a simple push won't work
        return [...tasks, { name: action.task.name, increment: action.task.increment, total: 0 }]
      }
      case 'delete_task': {
        return tasks.filter((task: Task) => action.name !== task.name)
      }
      default: {
        return tasks;
      }

    }
  }

  function completeTask(task: Task) {
    dispatch({
      type: 'add_task',
      task: task
    })
  }

  return (
    <>
      <section id="center">
        <Container bgImage={bgImage}>
          <Calendar />
          <div className='flex justify-center gap-8'>
            <RainbowButton>Select</RainbowButton>
            <RainbowButton>Select</RainbowButton>
          </div>
        </Container>
      </section>
    </>
  )
}

export default App
