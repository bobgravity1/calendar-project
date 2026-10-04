import React, { useEffect, useState } from "react";
import plus from '@icons/plus.svg'
import plusToCheck from '@icons/plus-to-check.gif'
import type { Task } from "@/types/user";
import { useContext } from "react";
import { UserContext } from "@/App";

// onClick={() => completeTask(task)}

export const TaskComplete = ({ task }: { task: Task }) => {
    const { name, increment, total } = task;
    const context = useContext(UserContext)
    const [click, setClick] = useState(false)

    if (!context) throw new Error(`no context found`)
    const { user, dispatch } = context;

    function completeTask(clickedTask: Task) {
        setClick(true)
        dispatch({ type: 'complete_task', name: clickedTask.name })
    }

    useEffect(() => {
        setTimeout(() => setClick(false), 2000)
    }, [click])

    return (
        <button onClick={() => completeTask(task)} className="inline-flex items-center gap-2">
            {click ? <img className='size-6' src={plusToCheck} alt="" />
                : <img className='size-6' src={plus} alt="" />}
            <p className='clearfix-none whitespace-nowrap text-secondary text-lg font-semibold'>{name}</p>
        </button>
    )
};
