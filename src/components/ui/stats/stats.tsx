import caretRight from '@icons/caret-right.svg'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heatmap } from '@/components/ui/heatmap'
import { LineChart } from './ui/linechart'
import { TotalsByTask } from './ui/totalsByTask'

export const Stats = () => {
  return (
    <section className="pb-12">
      <div className="mx-auto grid grid-cols-3 flex-wrap gap-4 max-w-6xl mb-4">
        <Card variant="glass-dark" className="w-full h-40 rounded-lg">
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
          </CardHeader>
          <CardContent>
            <strong>9</strong> days
          </CardContent>
          <CardDescription>in a row with at least one</CardDescription>
        </Card>
        <Card variant="glass-dark" className="w-full h-40 rounded-lg">
          <CardHeader>
            <CardTitle>Logs this week</CardTitle>
          </CardHeader>
          <CardContent>
            <strong>0</strong> logs
          </CardContent>
          <CardDescription>across all tasks</CardDescription>
        </Card>

        <Card variant="glass-dark" className="w-full h-40 rounded-lg">
          <CardHeader>
            <CardTitle>Task today</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 text-left">
                <img src={caretRight} alt="" />
                <span>hey</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  render={<Button type="button" className="w-full" />}
                  closeOnClick={false}
                >
                  Placeholder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
        <Card variant="glass-dark" className="col-span-3 h-80 w-full">
          <LineChart />
        </Card>
      </div>
      <div className="mx-auto grid grid-cols-1 gap-4 max-w-6xl md:grid-cols-2">
        <Card variant="glass-dark">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>0 logs per day · last 18 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap />
          </CardContent>
        </Card>
        <TotalsByTask />
      </div>
    </section>
  )
}
