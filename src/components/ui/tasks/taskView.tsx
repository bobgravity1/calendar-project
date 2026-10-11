import React, { useContext, useRef, useState } from "react";
import { UserContext } from "@/App";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Button } from "@/components/ui/button"
import caretRight from '@icons/caret-right.svg'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import plus from '@icons/plus.svg'
import plusToCheck from '@icons/plus-to-check.gif'
import { Dialog, DialogTrigger } from "../dialog";
import { CreateTask } from "./createTask";
import type { Task } from "@/types/user";
import { EditTask } from "./editTask";
// const createNewTask = () => {

//     dispatch({ type: 'add_task', null })
// }

export const TaskView = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error(`context not found`);
    const { user, dispatch } = context;
    const [clickedTasks, setClickedTasks] = useState<Record<string, number>>({});
    const animationRun = useRef(0);

    const createTask = (task: Task) => {
        dispatch({ type: 'add_task', task })
    }

    const deleteDBTask = async (task: Task) => {
        try {
            const deletedUser = await fetch(`${import.meta.env.VITE_API_URL}/api/task/delete-task/${task.name}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }).then(res => res.json())
        }
        catch (err) {
            throw new Error(`User NOT Deleted:${err}`)
        }
    }

    const deleteTask = (task: Task) => {
        dispatch({ type: 'delete_task', task })
        deleteDBTask(task)
    }

    const editTask = (task: Task) => {
        dispatch({ type: 'edit_task', task })
    }

    const incrementTask = (task: Task) => {
        dispatch({ type: 'complete_task', task })
    }

    const handleIncrementClick = (task: Task) => {
        const run = ++animationRun.current;
        setClickedTasks(previous => ({ ...previous, [task.name]: run }));
        setTimeout(() => {
            setClickedTasks(previous => previous[task.name] === run
                ? { ...previous, [task.name]: 0 }
                : previous);
        }, 700);
        incrementTask(task)
    }

    return (
        <section className='relative mx-auto grid grid-cols-2 flex-wrap gap-4 max-w-5xl'>
            <Card variant="glass-dark" className="w-full rounded-lg">
                <ul className="p-4 border border-white/40 rounded-lg">
                    {user.tasks.map((task: Task) => {
                        return (
                            <li key={task.name} className='w-full flex justify-between text-lg'><div className='text-secondary'>{task.name} <span className='text-muted-foreground'>- {task.total} {task.unit}</span></div>
                                <div className='mb-4 flex items-center gap-4'>
                                    <button type="button" onClick={() => handleIncrementClick(task)} aria-label={`Increment ${task.name}`} className="flex h-[105%] cursor-pointer px-2.5 items-center justify-center rounded-sm border-2 border-white/30 transition-colors hover:bg-secondary/10">
                                        <img className="opacity-70 size-5" src={clickedTasks[task.name] ? `${plusToCheck}?run=${clickedTasks[task.name]}` : plus} alt="" />
                                    </button>
                                    <Button notification onClick={() => deleteTask(task)} variant='destructive'>Delete Task</Button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
                <CardFooter className='mt-auto gap-2 px-0'>
                    <CreateTask createTask={createTask}>
                        <Button variant='secondary' className="flex-1">Create Task</Button>
                    </CreateTask>
                    <EditTask user={user} editTask={editTask}>
                        <Button variant='secondary' className="flex-1">Edit Task</Button>
                    </EditTask>
                </CardFooter>
            </Card>
            <Card variant="glass-dark" className="w-full rounded-lg">
                <CardHeader>
                    <CardTitle>test Stats</CardTitle>
                    <CardDescription>
                        Weekly snapshots. No more manual exports.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ul className="grid gap-2 py-2 text-sm">
                        {[
                            "Choose a schedule (daily, or weekly).",
                            "Send to channels or specific teammates.",
                            "Include charts, tables, and key metrics.",
                        ].map((label) => (
                            <li key={label} className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 text-left">
                                        <img src={caretRight} alt="" />
                                        <span>{label}</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem render={<Button type="button" className="w-full" />} closeOnClick={false}>
                                            Placeholder
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="mt-auto gap-2 px-0">
                    <Button className="flex-1">
                        Set up scheduled reports
                    </Button>
                    <Button variant="secondary" className="flex-1">
                        See what&apos;s new
                    </Button>
                </CardFooter>
            </Card>
        </section >
    )
};
