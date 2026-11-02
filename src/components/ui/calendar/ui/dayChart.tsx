import React from 'react'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { days } from '@/data/dates'
import type { Task, TaskAction, User } from '@/types/user'

// placeholder amounts so the bars render until real log totals go in
const chartData = days.map((day, index) => ({
  day,
  amount: [4, 6, 3, 7, 5, 8, 2][index],
}))

const chartConfig = {
  amount: {
    label: 'Amount',
    color: 'rgb(255 255 255 / 80%)',
  },
} satisfies ChartConfig

export const DayChart = ({
  user,
  dispatch,
}: {
  user: User
  dispatch: React.Dispatch<TaskAction>
}) => {
  return (
    <Card className="h-full min-h-96 min-w-0 w-full bg-transparent border border-white/20 text-white">
      <CardHeader className="gap-y-3 max-sm:grid-cols-1">
        <CardTitle>Logs</CardTitle>
        <CardAction className="static col-start-1 row-start-auto justify-self-start sm:absolute sm:top-4 sm:right-4">
          <Tabs defaultValue="week">
            <TabsList variant="glass-light" className="border border-white/20 text-white">
              <TabsTrigger value="week">week</TabsTrigger>
              <TabsTrigger value="month">month</TabsTrigger>
              <TabsTrigger value="year">year</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <ChartContainer config={chartConfig} className="flex-1 min-h-56 lg:min-h-0 aspect-auto bg-glass-dark bg-none [--glass-dark:oklch(0.2_0.02_275/30%)] rounded-lg [&_.recharts-cartesian-axis-tick_text]:!fill-white">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} syncWithTicks />
            <YAxis
              domain={[0, 280]}
              ticks={[40, 80, 120, 160, 200, 240, 280]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              interval={0}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="mt-auto gap-3">
        <Button type="button" variant="secondary" className="flex-1">View logs</Button>
        <Button type="button" variant="secondary" className="flex-1">Export CSV</Button>
      </CardFooter>
    </Card>
  )
}
