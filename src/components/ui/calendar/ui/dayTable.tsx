import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Task, TaskAction, User } from '@/types/user'

export const DayTable = ({
  user,
  dispatch,
}: {
  user: User
  dispatch: React.Dispatch<TaskAction>
}) => {
  const footer = (
    <CardFooter className="mt-auto">
      <TabsList variant="line" className="contents">
        <TabsTrigger
          value="reports"
          buttonVariant="default"
          className="flex-1 data-active:hidden"
        >
          Set up scheduled reports
        </TabsTrigger>
        <TabsTrigger
          value="totals"
          buttonVariant="default"
          className="flex-1 data-active:hidden"
        >
          Back to totals
        </TabsTrigger>
      </TabsList>
      <Button type="button" variant="secondary" className="flex-1">
        Export CSV
      </Button>
    </CardFooter>
  )

  return (
    <Tabs defaultValue="totals" className="h-full w-full">
      <TabsContent value="totals" className="h-full">
        <Card variant="glass-dark" className="h-full">
          <CardHeader>
            <CardTitle>Totals by task</CardTitle>
            <CardDescription>Today, last 7 days, all time</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Today</TableHead>
                  <TableHead className="text-right">7 days</TableHead>
                  <TableHead className="text-right">All time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Task name <span className="ml-1 opacity-60">unit</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Task name <span className="ml-1 opacity-60">unit</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Task name <span className="ml-1 opacity-60">unit</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                  <TableCell className="text-right font-mono">0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          {footer}
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle variant="form">Set up scheduled reports</CardTitle>
          </CardHeader>
          <CardContent />
          {footer}
        </Card>
      </TabsContent>
    </Tabs>
  )
}
