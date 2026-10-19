import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Task, User } from '@/types/user'


interface EditTaskProps {
    user: User;
    editTask: (task: Task) => void
    initialTask?: Task;
    onBack?: () => void;
}

export function EditTask({ editTask, user, initialTask, onBack }: EditTaskProps) {
    const [taskSelect, setTaskSelect] = useState<string | null>(initialTask?.name ?? null)
    const [formValues, setFormValues] = useState(() => initialTask ? { ...initialTask } : { name: '', unit: '', increment: 0, total: 0 })

    // derived from live state, not copied — shows the saved stats while the form holds the draft
    const selectedTask = user.tasks.find(task => task.name === taskSelect)

    const selectTask = (task: Task) => {
        // the form is a draft copy on purpose: edits stay local until Submit dispatches them
        setFormValues({ ...task })
        setTaskSelect(task.name)
    }

    const stepIncrement = (amount: number) => {
        setFormValues((previous) => ({ ...previous, increment: Math.max(1, Number(previous.increment) + amount) }))
    }

    const onSubmission = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const anyNulls = Object.values(formValues).some(val => val === '') ||
            Number(formValues.increment) === 0
        !anyNulls && editTask({ ...formValues, increment: Number(formValues.increment) })
    }

    const formChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setFormValues((previous) => ({ ...previous, [name]: value }));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle variant="form">Edit Task</CardTitle>
                <CardDescription>
                    {selectedTask ? `${selectedTask.total} ${selectedTask.unit} logged so far` : 'Choose a task to edit its details.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!taskSelect ?
                    <ul className="grid gap-2">
                        {user.tasks.map((task: Task) => (
                            <li key={task.name}>
                                <Button type="button" variant="outline" onClick={() => selectTask(task)} className="w-full justify-between">
                                    {task.name}
                                    {task.unit && <Badge variant="secondary">{task.unit}</Badge>}
                                </Button>
                            </li>
                        ))}
                    </ul>
                    : <form onSubmit={onSubmission} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" name="name" variant="card" disabled value={formValues['name']} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-unit">Unit (eg. mg, exercise, meal)</Label>
                            <Input id="edit-unit" name="unit" variant="card" onChange={formChange} value={formValues['unit']} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Increment Amount(s) (eg. +1, +5 each time)</Label>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="icon" aria-label="Decrease increment" disabled={Number(formValues.increment) <= 1} onClick={() => stepIncrement(-1)}>−</Button>
                                <output className="flex-1 text-center" aria-live="polite">
                                    <span key={formValues.increment} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-150">+{formValues.increment}</span>
                                </output>
                                <Button type="button" variant="outline" size="icon" aria-label="Increase increment" onClick={() => stepIncrement(1)}>+</Button>
                            </div>
                            <span className="text-xs/relaxed italic opacity-60">* If you take 40mg average you can still set this to 10 and increment by 4 every log</span>
                        </div>

                        <Button disabled={formValues.name.length === 0} type="submit">Submit</Button>
                        <Button type="button" variant="outline" onClick={() => { setTaskSelect(null); onBack?.() }}>Back to tasks</Button>
                    </form>}
            </CardContent>
        </Card>
    )
}
