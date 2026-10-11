

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import caretRight from '@icons/caret-right.svg'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Chart } from "./ui/chart"

export const Stats = () => {
    return (
        <section className='mx-auto grid grid-cols-2 flex-wrap gap-4 max-w-5xl'>
            <Card variant="glass-dark" className="w-full rounded-lg">
                <div className="label">Current streak</div>
                <div className="value text-glass"><span id="v-streak">9</span> <span className="unit">days</span></div>
                <div className="cap">in a row with at least one</div>
            </Card>

            <Card variant="glass-dark" className="w-full rounded-lg">
                <CardHeader>
                    <CardTitle>test Stats</CardTitle>
                    <CardDescription>
                        Weekly snapshots. No more manual exports.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ul className="grid gap-2 py-2 text-sm">
                        {[
                            "Choose a schedule (daily, or weekly).",
                            "Send to channels or specific teammates.",
                            "Include charts, tables, and key metrics.",
                        ].map((label) => (
                            <li key={label} className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 text-left">
                                        <img src={caretRight} alt="" />
                                        <span>{label}</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem render={<Button type="button" className="w-full" />} closeOnClick={false}>
                                            Placeholder
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    <Button className="w-full">
                        Set up scheduled reports
                    </Button>
                    <Button variant="secondary" className="w-full">
                        See what&apos;s new
                    </Button>
                </CardFooter>
            </Card>

            <Card className='bg-glass-dark col-span-2 h-80 w-full rounded-lg'>
                <Chart />
            </Card>
        </section >

    )
};
