import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { use, useContext, useState, type SetStateAction } from "react";
import type { Task, User } from '@/types/user'
import { UserContext } from "@/App";


interface EditTaskProps {
    children: React.ReactElement;
    user: User;
    editTask: (task: Task) => void
}

export function EditTask({ children, editTask, user }: EditTaskProps) {
    const [taskSelect, setTaskSelect] = useState<string | null>(null)
    const [formValues, setFormValues] = useState({ name: '', unit: '', increment: 0, total: 0 })

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
        // reset after the close animation finishes so the list doesn't flash in while it fades out
        <Dialog onOpenChangeComplete={(open) => !open && setTaskSelect(null)}>
            {/* Open Dialog box */}
            <DialogTrigger render={children} />
            <DialogContent className="rounded-t-xl border border-white/40 border-t-white/90 border-b-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(0,0,0,0.2)] sm:max-w-md">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold text-title">Edit Task</DialogTitle>
                    <DialogDescription className="text-sm/relaxed text-primary/65">
                        {selectedTask ? `${selectedTask.total} ${selectedTask.unit} logged so far` : 'Edit Task Details'}
                    </DialogDescription>
                </DialogHeader>
                {!taskSelect ?
                    <DialogFooter className="flex-col! items-stretch! gap-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                        <ul className="grid gap-2">
                            {user.tasks.map((task: Task) => {
                                return (
                                    <li key={task.name}>
                                        <button type="button" onClick={() => selectTask(task)} className="flex h-10 w-full cursor-pointer items-center justify-between rounded-sm border border-black/20 bg-white px-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-primary">
                                            {task.name}
                                            <span className="font-normal text-primary/50">{task.total} {task.unit}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                        <DialogClose render={<Button type="button" variant="outline" className="w-full text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">Close</Button>} />
                    </DialogFooter>
                    : <DialogFooter className="flex-col! items-stretch! gap-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                        <form onSubmit={onSubmission} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-primary">Name</Label>
                                <Input name="name" disabled value={formValues['name']} className="h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-primary shadow-sm focus-visible:border-primary focus-visible:ring-primary/15" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit" className="text-sm font-semibold text-primary">Unit (eg. mg, exercise, meal)</Label>
                                <Input name="unit" onChange={formChange} value={formValues['unit']} className="h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-primary shadow-sm focus-visible:border-primary focus-visible:ring-primary/15" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="increment" className="text-sm font-semibold text-primary">Increment Amount(s) (eg. +1, +5 each time)</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" disabled={Number(formValues.increment) <= 1} onClick={() => stepIncrement(-1)} className="size-10 text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">−</Button>
                                    <div className="grid h-10 flex-1 place-items-center overflow-hidden rounded-sm border border-black/20 bg-white text-sm font-semibold text-primary shadow-sm">
                                        {/* key remounts the number on each change so the small animation replays */}
                                        <span key={formValues.increment} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-150">+{formValues.increment}</span>
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => stepIncrement(1)} className="size-10 text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">+</Button>
                                </div>
                                <span className="-mt-1 text-[11px]/relaxed font-normal italic text-primary/50">* If you take 40mg average you can still set this to 10 and increment by 4 every log</span>
                            </div>

                            <DialogClose render={<Button disabled={formValues.name.length === 0} type='submit' className="w-full text-sm font-semibold">Submit</Button>} />
                        </form>
                        <DialogClose render={<Button type="button" variant="outline" className="w-full text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">Close</Button>} />
                    </DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
