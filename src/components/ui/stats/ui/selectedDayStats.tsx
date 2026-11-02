import plus from '@icons/plus.svg'
import plusToCheck from '@icons/plus-to-check.gif'
import { XIcon } from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";
import { months } from "@/data/dates";
import type { MonthName } from "@/types/dates";
import type { Task } from "@/types/user";
import { Button } from "../../button";
import { PopoverClose } from "../../popover";

// onClick={() => completeTask(task)}

export const SelectedDayStats = ({ day, month }: { day: number, month: number }) => {
    console.log(day, month)
    let monthDisplay = months[month]


    const context = useContext(UserContext)
    if (!context) throw new Error(`context not found for user`)
    const { user, dispatch } = context;

    const [click, setClick] = useState(false)

    const selectTask = (name: string) => {
        return user.tasks.find(task => task.name === name)
    }

    useEffect(() => {
        setTimeout(() => setClick(false), 2000)
    }, [click])

    return (

        <section className="grid gap-2">
            <PopoverClose render={<Button variant="outline" size="icon-sm" className="absolute top-4 right-4 border border-primary! text-primary" />}>
                <XIcon />
                <span className="sr-only">Close</span>
            </PopoverClose>
            <span className=" text-lg font-bold text-title">{monthDisplay} {day}</span>
            <ul className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 mb-4">
                {user.tasks.map((task: Task) => {
                    return (
                        <li key={task.name} className="col-span-2 grid grid-cols-subgrid items-center text-xs font-semibold text-stone-800">
                            {task.name}
                            <span className="font-semibold relative right-4 text-left text-stone-800">{task.total} {task.unit}</span>
                        </li>
                    )
                })}
            </ul>

        </section>
    )
};
