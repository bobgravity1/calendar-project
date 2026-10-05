import React, { useContext } from "react";
import { UserContext } from "@/App";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Button } from "@/components/ui/button"
import caretRight from '@icons/caret-right.svg'
import { Dialog, DialogTrigger } from "../dialog";
import { CreateTask } from "./createTask";
import type { Task } from "@/types/user";
// const createNewTask = () => {

//     dispatch({ type: 'add_task', null })
// }

export const TaskView = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error(`context not found`);
    const { user, dispatch } = context;

    const createTask = (task: Task) => {
        dispatch({ type: 'add_task', task })
    }

    return (
        <section className='relative mx-auto grid grid-cols-2 flex-wrap gap-4 max-w-5xl'>
            <Card variant="glass-dark" className="w-full rounded-lg">
                <ul className="p-4 border border-white/40 rounded-lg">
                    {user.tasks.map((task: Task) => {
                        return (
                            <li className='text-lg'>{task.name}</li>
                        )
                    })}
                </ul>
                <div className='absolute left-8 bottom-8'>
                    <CreateTask createTask={createTask}>
                        <Button>Create Task</Button>
                    </CreateTask>
                </div>
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
                        <li className="flex gap-2">

                            <span>Choose a schedule (daily, or weekly).</span>
                        </li>
                        <li className="flex gap-2">
                            <img src={caretRight} />
                            <span>Send to channels or specific teammates.</span>
                        </li>
                        <li className="flex gap-2">
                            <img src={caretRight} />
                            <span>Include charts, tables, and key metrics.</span>
                        </li>
                    </ul>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    <Button className="w-full">
                        Set up scheduled reports
                    </Button>
                    <Button variant="secondary" className="w-full">
                        See what&apos;s new
                    </Button>
                </CardFooter>
            </Card>
        </section >
    )
};
