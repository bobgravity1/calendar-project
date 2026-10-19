import plus from '@icons/plus.svg'
import plusToCheck from '@icons/plus-to-check.gif'
import { DotsThreeIcon } from '@phosphor-icons/react'
import React, { useContext, useRef, useState } from 'react'
import { UserContext } from '@/App'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task } from '@/types/user'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card'
import { EventClick } from '../event-click'
import { CreateTask } from './createTask'
import { EditTask } from './editTask'
import { Notification } from './notification'
// const createNewTask = () => {

//     dispatch({ type: 'add_task', null })
// }

import { deleteDBTask } from '../../../lib/api/db-functions'

export const TaskView = ({
  createDBLog,
}: {
  createDBLog: (task: Task) => Promise<void>
}) => {
  const context = useContext(UserContext)
  if (!context) throw new Error(`context not found`)
  const { user, dispatch } = context
  const [clickedTasks, setClickedTasks] = useState<Record<string, number>>({})
  const animationRun = useRef(0)
  const [panel, setPanel] = useState<'create' | 'edit'>('create')
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  const createTask = (task: Task) => {
    dispatch({ type: 'add_task', task })
  }

  const deleteTask = (task: Task) => {
    dispatch({ type: 'delete_task', task })
    deleteDBTask(task)
  }

  const editTask = (task: Task) => {
    dispatch({ type: 'edit_task', task })
  }

  const handleIncrementClick = (task: Task) => {
    const run = ++animationRun.current
    setClickedTasks((previous) => ({ ...previous, [task.name]: run }))
    setTimeout(() => {
      setClickedTasks((previous) =>
        previous[task.name] === run
          ? { ...previous, [task.name]: 0 }
          : previous,
      )
    }, 700)

    createDBLog(task)
  }

  return (
    <section className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-8 md:grid-cols-[1.25fr_1fr] md:px-0">
      <Card
        variant="glass-dark"
        badge={<Badge variant="primary">{user.tasks.length} tasks</Badge>}
        className="md:min-h-[34rem]"
      >
        <CardHeader>
          <CardTitle>Your tasks</CardTitle>
          <CardDescription>Tap + to log one increment.</CardDescription>
        </CardHeader>
        <CardContent>
          {user.tasks.length === 0 && (
            <div className="grid gap-2 py-8 text-center">
              <CardTitle>No Tasks Yet</CardTitle>
              <CardDescription>
                Create one and it shows up on every day in the calendar and will
                be logged.
              </CardDescription>
            </div>
          )}
          <ul className="grid gap-2">
            {user.tasks.map((task: Task) => (
              <li key={task.name}>
                <Card variant="glass-dark" size="sm">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-normal">
                        {task.name}
                        {task.unit && (
                          <Badge variant="primary">{task.unit}</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        +{task.increment} {task.unit} per log · {task.total}{' '}
                        {task.unit} today
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <EventClick>
                        <Button
                          type="button"
                          variant="increment"
                          size="icon"
                          onClick={() => handleIncrementClick(task)}
                          aria-label={`Increment ${task.name}`}
                        >
                          <img
                            className="size-5 opacity-70"
                            src={
                              clickedTasks[task.name]
                                ? `${plusToCheck}?run=${clickedTasks[task.name]}`
                                : plus
                            }
                            alt=""
                          />
                        </Button>
                      </EventClick>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="plain"
                              size="icon-sm"
                              aria-label={`Actions for ${task.name}`}
                            />
                          }
                        >
                          <DotsThreeIcon weight="bold" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setTaskToEdit(task)
                              setPanel('edit')
                            }}
                          >
                            Edit task
                          </DropdownMenuItem>
                          <DropdownMenuFooter>
                            <Notification onConfirm={() => deleteTask(task)}>
                              <DropdownMenuItem
                                variant="destructive"
                                nativeButton
                                render={<button type="button" />}
                                closeOnClick={false}
                              >
                                Delete task
                              </DropdownMenuItem>
                            </Notification>
                          </DropdownMenuFooter>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            type="button"
            variant="secondary"
            aria-pressed={panel === 'create'}
            onClick={() => setPanel('create')}
            className="flex-1"
          >
            Create Task
          </Button>
          <Button
            type="button"
            variant="secondary"
            aria-pressed={panel === 'edit'}
            onClick={() => {
              setTaskToEdit(null)
              setPanel('edit')
            }}
            className="flex-1"
          >
            Edit Task
          </Button>
        </CardFooter>
      </Card>
      {panel === 'create' ? (
        <CreateTask createTask={createTask} />
      ) : (
        <EditTask
          key={taskToEdit ? `task:${taskToEdit.name}` : 'list'}
          user={user}
          editTask={editTask}
          initialTask={taskToEdit ?? undefined}
          onBack={() => setTaskToEdit(null)}
        />
      )}
    </section>
  )
}
