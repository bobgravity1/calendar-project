import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface NotificationProps {
    children: React.ReactElement;
    onConfirm: React.ComponentProps<typeof Button>['onClick']
}

export function Notification({ children, onConfirm }: NotificationProps) {
    return (
        <Dialog>
            {/* Open Dialog box */}
            <DialogTrigger render={children} />
            <DialogContent className="rounded-t-xl border border-white/40 border-t-white/90 border-b-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_rgba(0,0,0,0.2)] sm:max-w-sm">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-center text-xl font-bold text-title">Are you sure?</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center gap-3">
                    <DialogClose render={<Button type="button" onClick={onConfirm} className="flex-1 text-sm font-semibold">Confirm</Button>} />
                    <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-sm font-semibold text-primary ring-black/20 hover:bg-black/5">Cancel</Button>} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
