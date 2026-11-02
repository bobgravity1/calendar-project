import caretRight from '@icons/caret-right.svg'
import { ListIcon } from '@phosphor-icons/react'
import {
  createContext,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  useReducer,
} from 'react'
import bgImage from '@/assets/background/gradient.webp'
import { Container } from '@/components/container/container'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar/calendar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCalendarStore } from '@/features/calendar/useCalendarState'
import { runViewTransition } from '@/lib/view-transition'
import useView from '@/store/useAppStore'
import type { Log, Task, TaskAction, User } from '@/types/user'
import { Stats } from './components/ui/stats/stats'
import { TaskView } from './components/ui/tasks/taskView'

import {
  createDBLog,
  getAllDBLogs,
  getAllLogs,
  getDBTodayLogs,
} from './lib/api/log/log-functions'
import { getAllTasks } from './lib/api/task/task-functions'

const dbTasks = await getAllTasks()
const dbLogs = await getAllLogs()

const user: User = {
  name: 'Bobby',
  tasks: [...dbTasks],
  reminders: [],
  logs: [...dbLogs],
}

type UserTaskContext = {
  user: User
  dispatch: React.Dispatch<TaskAction>
}

import type { ViewName } from '@/store/useAppStore'
import { views } from '@/store/useAppStore'

export const UserContext = createContext<UserTaskContext | null>(null)

function App() {
  const [currentUser, dispatch] = useReducer(setTasks, user)
  const view = useView((state) => state.view)
  const setView = useView((state) => state.setView)
  const setCalView = useCalendarStore((state) => state.setCalendarView)
  const currCalView = useCalendarStore((state) => state.view)

  function setUserView(name: ViewName) {
    runViewTransition(() => setView({ name }))
    if (name === 'calendar') {
      currCalView === 'month'
        ? runViewTransition(() => setCalView('year'))
        : runViewTransition(() => setCalView('month'))
    }
  }
  function setTasks(user: User, action: TaskAction) {
    switch (action.type) {
      case 'add_task':
        // names are how every action finds a task, a duplicate would get updated alongside the original
        if (user.tasks.some((task) => task.name === action.task.name))
          return user
        return {
          ...user,
          tasks: [...user.tasks, action.task],
        }
      case 'delete_task':
        const newTasks = user.tasks.filter(
          (task) => task.name !== action.task.name,
        )
        return {
          ...user,
          tasks: [...newTasks],
        }
      case 'edit_task':
        const editedTasks = user.tasks.map((task) =>
          task.name === action.task.name ? action.task : task,
        )
        return {
          ...user,
          tasks: editedTasks,
        }
      // CONTINUE THIS TOMORROW

      case 'add_log':
        return { ...user, logs: [...user.logs, action.log] }
      // case "complete_task":
      //   const matchedTask = user.tasks.map(task => {
      //     if (task.name === action.task.name) {
      //       return { ...task, total: Number(task.increment + task.total) }
      //     }
      //     return task
      //   })
      //   return { ...user, tasks: matchedTask }
      default: {
        return user
      }
    }
  }

  const contextValue = {
    user: currentUser,
    dispatch,
  }

  return (
    <Container bgImage={bgImage}>
      <UserContext.Provider value={contextValue}>
        <section id="center" className="flex min-h-svh flex-col justify-center py-4 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Sheet>
              <div className="relative mx-4 mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-y-4 lg:mx-8 lg:mb-8 lg:gap-x-1">
                <div className="col-span-3 row-start-2 flex justify-center gap-x-2 lg:col-span-1 lg:row-start-1 lg:justify-start lg:gap-x-8">
                  {views.map((view: ViewName) => {
                    return (
                      <Button
                        key={view}
                        variant="ghost"
                        onClick={() => setUserView(view)}
                        className="min-w-0 flex-1 rounded-sm text-sm sm:flex-none sm:w-30"
                      >
                        {view}
                      </Button>
                    )
                  })}
                </div>
                <h1 className="col-start-2 row-start-1 text-center text-3xl font-bold lg:text-4xl">
                  {new Date().getFullYear()}
                </h1>
                <SheetTrigger
                  render={
                    <Button variant="ghost" aria-label="Open menu" className="group col-start-3 row-start-1 size-11 justify-self-end p-2 lg:h-9 lg:w-24!">
                      <ListIcon className="size-6 lg:hidden" aria-hidden="true" />
                      <span className="relative left-2 hidden items-center lg:inline-flex">
                        <span>Menu</span>
                        <img
                          src={caretRight}
                          alt=""
                          aria-hidden="true"
                          className="-ml-2 size-7 transition-transform duration-200 group-hover:translate-x-px"
                        />
                      </span>
                    </Button>
                  }
                />
              </div>
              {view === 'calendar' && <Calendar createDBLog={createDBLog} />}
              {view === 'stats' && <Stats />}
              {view === 'tasks' && <TaskView createDBLog={createDBLog} />}
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Tasks</SheetTitle>
                  <SheetDescription>
                    <h2 className="text-2xl font-semibold">
                      User: {user.name}
                    </h2>
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
        </section>
      </UserContext.Provider>
    </Container>
  )
}

export default App
