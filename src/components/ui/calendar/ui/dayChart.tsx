import React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
    // shadcn's default chart blue, lightened and pulled toward the app's 275 hue
    color: 'oklch(0.72 0.13 272)',
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
    <Card variant="glass-dark" className="h-full w-full">
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardAction>
          <Tabs defaultValue="week">
            <TabsList variant="glass-light" className="border border-white/20">
              <TabsTrigger value="week">week</TabsTrigger>
              <TabsTrigger value="month">month</TabsTrigger>
              <TabsTrigger value="year">year</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
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
    </Card>
  )
}
