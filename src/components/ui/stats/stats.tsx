

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
import { Chart } from "@/components/ui/stats/chart"

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
                        <li className="flex gap-2">

                            <span>Choose a schedule (daily, or weekly).</span>
                        </li>
                        <li className="flex gap-2">
                            <img src={caretRight} />
                            <span>Send to channels or specific teammates.</span>
                        </li>
                        <li className="flex gap-2">
                            <img src={caretRight} />
                            <span>Include charts, tables, and key metrics.</span>
                        </li>
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
