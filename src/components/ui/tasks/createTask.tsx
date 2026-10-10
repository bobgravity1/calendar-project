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
import type { Task } from '@/types/user'
import { UserContext } from "@/App";

interface CreateTaskProps {
    children: React.ReactElement;
    createTask: (task: Task) => void
}

export function CreateTask({ children, createTask }: CreateTaskProps) {
    const [formValues, setFormValues] = useState({ name: '', unit: '', increment: 0, total: 0 })

    const onSubmission = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const anyNulls = Object.values(formValues).some(val => val === '') ||
            formValues.increment === 0
        !anyNulls && setFormValues({ name: formValues.name, unit: formValues.unit, increment: formValues.increment, total: 0 })
        createTask(formValues)
    }

    const formChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setFormValues((previous) => ({ ...previous, [name]: value }));
    }

    return (
        <Dialog>
            {/* Open Dialog box */}
            <DialogTrigger render={children} />
            <DialogContent className="rounded-t-xl border border-white/40 border-t-white/90 border-b-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(0,0,0,0.2)] sm:max-w-md">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold text-title">Create Task</DialogTitle>
                    <DialogDescription className="text-sm/relaxed text-primary/65">
                        Type in the name and set the increment factor (1, 5, 10 etc.)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col! items-stretch! gap-3">
                    <form onSubmit={onSubmission} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-primary">Name</Label>
                            <Input name="name" onChange={formChange} value={formValues['name']} className="h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-primary shadow-sm focus-visible:border-primary focus-visible:ring-primary/15" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit" className="text-sm font-semibold text-primary">Unit (eg. mg, exercise, meal)</Label>
                            <Input name="unit" onChange={formChange} value={formValues['unit']} className="h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-primary shadow-sm focus-visible:border-primary focus-visible:ring-primary/15" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="increment" className="text-sm font-semibold text-primary">Increment Amount(s) (eg. +1, +5 each time)</Label>
                            <Input name="increment" onChange={formChange} value={formValues['increment']} className="h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-primary shadow-sm focus-visible:border-primary focus-visible:ring-primary/15" />
                            <span className="-mt-1 text-[11px]/relaxed font-normal italic text-primary/50">* If you take 40mg average you can still set this to 10 and increment by 4 every log</span>
                        </div>

                        <DialogClose render={<Button disabled={formValues.name.length === 0} type='submit' className="w-full text-sm font-semibold">Submit</Button>} />
                    </form>
                    <DialogClose render={<Button type="button" variant="outline" className="w-full text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">Close</Button>} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
