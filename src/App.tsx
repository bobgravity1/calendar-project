import { Calendar } from '@/components/ui/calendar/calendar'
import { Stats } from './components/ui/stats/stats'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/container/container'
import { createContext, useReducer } from 'react'
import type { Task, TaskAction, User } from '@/types/user'
import useView from '@/store/useAppStore'
import { useCalendarStore } from '@/features/calendar/useCalendarState'
import { runViewTransition } from '@/lib/view-transition'
import caretRight from '@icons/caret-right.svg'
import bgImage from '@/assets/background/gradient.webp'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const user: User = {
  name: 'Bobby',
  tasks: [
    { name: 'cookie', increment: 20, total: 0 },
    { name: 'leg exercises', increment: 1, total: 0 },
    { name: 'poop', increment: 1, total: 0 }
  ],
  reminders: [],
  subscriptions: [],
}

type UserTaskContext = {
  user: User,
  dispatch: React.Dispatch<TaskAction>
}


import { views } from '@/store/useAppStore'
import type { ViewName } from '@/store/useAppStore'

export const UserContext = createContext<UserTaskContext | null>(null)
const year = new Date().getFullYear();

function App() {
  const [tasks, dispatch] = useReducer(setTasks, user.tasks);
  const view = useView((state) => state.view)
  const setView = useView((state) => state.setView)
  const setCalView = useCalendarStore((state) => state.setCalendarView)
  const currCalView = useCalendarStore((state) => state.view)

  function setUserView(name: ViewName) {
    runViewTransition(() => setView({ name }))
    if (name === 'calendar') {
      currCalView === 'month' ? runViewTransition(() => setCalView('year')) : runViewTransition(() => setCalView('month'))
    }
  }

  function setTasks(tasks: Task[], action: TaskAction) {
    switch (action.type) {
      case "complete_task": {
        return tasks.map((task: Task) => action.name === task.name ? { ...task, total: task.total + task.increment } : task)
      }
      case "add_task": {
        // includes would only work for partial match. that would still pass.
        const match = tasks.some(task => task.name === action.task.name)
        if (match) {
          return [...tasks]
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

  function completeTask(clickedTask: Task) {
    dispatch({ type: 'complete_task', name: clickedTask.name })
  }

  const contextValue = {
    user,
    dispatch
  }

  return (
    <Container bgImage={bgImage}>
      <UserContext.Provider value={contextValue}>
        <section id="center">
          <div className='max-w-7xl mx-auto'>
            <Sheet>
              <div className="flex justify-between m-8 items-center gap-x-1">
                <div className='flex gap-x-8'>
                  {views.map((view: ViewName) => {
                    return (
                      <Button key={view} variant="ghost" onClick={() => setUserView(view)} className="w-30 rounded-sm text-sm">
                        {view}
                      </Button>
                    )
                  })}
                </div>
                <h1 className="text-center text-4xl font-bold">{new Date().getFullYear()}</h1>
                <SheetTrigger render={
                  <Button variant='plain' className="group w-32!">
                    <span className="inline-flex items-center">
                      <span>Menu</span>
                      <img
                        src={caretRight}
                        alt=""
                        aria-hidden="true"
                        className="-ml-2 size-8 transition-transform duration-200 group-hover:translate-x-px"
                      />
                    </span>
                  </Button>
                } />
              </div>
              {view === 'calendar' && <Calendar completeTask={completeTask} />}
              {view === 'stats' && <Stats />}
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Tasks</SheetTitle>
                  <SheetDescription>
                    <h2 className='text-2xl font-semibold'>User: {user.name}</h2>
                    {tasks.map(task => {
                      return (
                        <>
                          <p>{task.name}</p>
                          <p>{task.total}</p>
                        </>
                      )
                    })}
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </section >
      </UserContext.Provider>
    </Container>
  )
}

export default App
