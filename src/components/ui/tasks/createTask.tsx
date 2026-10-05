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
import { useState, type SetStateAction } from "react";
import type { Task } from '@/types/user'

interface CreateTaskProps {
    children: React.ReactElement;
    createTask: (task: Task) => void
}

export function CreateTask({ children, createTask }: CreateTaskProps) {
    const [formVal, setFormVal] = useState("");

    const onSubmission = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        createTask({ name: formVal, increment: 1, total: 0 })
    }

    const formChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setFormVal(e.target.value)
    }

    return (
        <Dialog>
            {/* Open Dialog box */}
            <DialogTrigger render={children} />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Type in the name and set the increment factor (1, 5, 10 etc.)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <div className="flex items-center gap-2">
                        <div className="grid flex-1 gap-2">
                            <form onSubmit={onSubmission}>
                                <Label htmlFor="new-task" className="sr-only">
                                    Link
                                </Label>
                                <Input onChange={formChange} value={formVal} />
                                <Button disabled={formVal.length === 0} type='submit'>Submit</Button>
                            </form>
                        </div>
                    </div>
                    <DialogClose render={<Button type="button">Close</Button>} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
