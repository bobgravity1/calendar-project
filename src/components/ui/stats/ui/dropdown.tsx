import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// import { Task } from "@/types/user"
import { UserContext } from "@/App"
import { useContext, useState } from "react"
import type { Task } from "@/types/user"



export const Dropdown = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error(`no state for user found`)
    const { user, dispatch } = context;
    const [selectedTask, setSelectedTask] = useState<string | null>(null)

    const inputItems = user.tasks.map((task: Task) => {
        return {
            value: task.name,
            label: task.name
        }
    })

    const items = [
        ...inputItems
    ]
    // for the chart
    // const task = user.tasks.find((t) => t.name === selectedTask)

    return (
        <Select value={selectedTask} onValueChange={(value) => {
            setSelectedTask(value)
        }} items={items} >
            <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Weekly Tasks</SelectLabel>
                    {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select >
    )
}