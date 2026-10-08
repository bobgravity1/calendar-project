import { Calendar } from '@/components/ui/calendar/calendar'
import { TaskView } from './components/ui/tasks/taskView'
import { Stats } from './components/ui/stats/stats'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/container/container'
import { createContext, useReducer, type JSXElementConstructor, type ReactElement, type ReactNode, type ReactPortal } from 'react'
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
    { name: 'kraties', unit: 'mg', increment: 10, total: 0 },
    { name: 'legs', unit: 'exercise', increment: 1, total: 0 },
    { name: 'poop', unit: '', increment: 1, total: 0 }
  ],
  reminders: []
}

type UserTaskContext = {
  user: User,
  dispatch: React.Dispatch<TaskAction>
}

import { views } from '@/store/useAppStore'
import type { ViewName } from '@/store/useAppStore'

export const UserContext = createContext<UserTaskContext | null>(null)

function App() {
  const [currentUser, dispatch] = useReducer(setTasks, user);
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
  function setTasks(user: User, action: TaskAction) {
    switch (action.type) {
      case "add_task":
        return {
          ...user, tasks: [...user.tasks, action.task]
        }
      case "delete_task":
        const newTasks = user.tasks.filter(task => task.name !== action.task.name)
        return {
          ...user, tasks: [...newTasks]
        }
      case "complete_task":
        const matchedTask = user.tasks.map(task => {
          if (task.name === action.task.name) {
            return { ...task, total: task.increment + task.total }
          }
          return task
        })
        return { user, tasks: matchedTask }
      default: {
        return user
      }
    }
  }

  function completeTask(task: Task) {
    dispatch({ type: 'complete_task', task })
  }

  const contextValue = {
    user: currentUser,
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
                  <Button variant='ghost' className="group w-32!">
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
              {view === 'tasks' && <TaskView />}
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Tasks</SheetTitle>
                  <SheetDescription>
                    <h2 className='text-2xl font-semibold'>User: {user.name}</h2>
                    {/* {tasks.map((task: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; total: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => {
                      return (
                        <>
                          <p>{task.name}</p>
                          <p>{task.total}</p>
                        </>
                      )
                    })} */}
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
