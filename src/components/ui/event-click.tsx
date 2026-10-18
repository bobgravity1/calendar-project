import { toast } from "@/components/ui/toast"
import type { ReactNode } from "react"



//     const [click, setClick] = useState(false)

//     useEffect(() => {
//         if (click) {
//             setTimeout(() => {
//                 setClick(!click)
//             }, 200)
//         }
//     }, [click])

export function EventClick({ children }: { children: ReactNode }) {

    function showToast(): void {
        toast.promise(
            new Promise<{ name: string }>((resolve) => {
                window.setTimeout(() => resolve({ name: "Event" }), 2000)
            }),
            {
                loading: "Creating event…",
                success: "Amount logged",
                error: "Could not create event.",
            }
        )
    }
    return (
        <div className="contents" onClick={showToast}>
            {children}
        </div>
    )
}