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

    useEffect(() => {
        setTimeout(() => setClick(false), 2000)
    }, [click])

    return (
        <button className="inline-flex items-center gap-2">
            {click ?
                <img className='size-6' src={plusToCheck} alt="" />
                : <img className='size-6' src={plus} alt="" />}

            <p className='clearfix-none whitespace-nowrap text-inherit text-lg font-semibold'>{name}</p>
        </button>
    )
};
