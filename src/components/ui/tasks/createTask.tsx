import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Task } from '@/types/user'
import { insertDBTask } from '../../../lib/api/db-functions'
import { EventClick } from '../event-click'

interface CreateTaskProps {
  createTask: (task: Task) => void
}

export function CreateTask({ createTask }: CreateTaskProps) {
  const [formValues, setFormValues] = useState({
    name: '',
    unit: '',
    increment: 0,
    total: 0,
  })

  const onSubmission = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const anyNulls =
      Object.values(formValues).some((val) => val === '') ||
      formValues.increment === 0
    if (anyNulls) return

    const task = { ...formValues, increment: Number(formValues.increment) }
    createTask(task)
    setFormValues({ name: '', unit: '', increment: 0, total: 0 })

    insertDBTask(task)
  }

  const formChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setFormValues((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle variant="form">Create Task</CardTitle>
        <CardDescription>
          Type in the name and set the increment factor (1, 5, 10 etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmission} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="create-name">Name</Label>
            <Input
              id="create-name"
              name="name"
              variant="card"
              onChange={formChange}
              value={formValues['name']}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-unit">Unit (eg. mg, exercise, meal)</Label>
            <Input
              id="create-unit"
              name="unit"
              variant="card"
              onChange={formChange}
              value={formValues['unit']}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-increment">
              Increment Amount(s) (eg. +1, +5 each time)
            </Label>
            <Input
              id="create-increment"
              name="increment"
              variant="card"
              onChange={formChange}
              value={formValues['increment']}
            />
            <span className="text-xs/relaxed italic opacity-60">
              * If you take 40mg average you can still set this to 10 and
              increment by 4 every log
            </span>
          </div>

          <EventClick>
            <Button disabled={formValues.name.length === 0} type="submit">
              Submit
            </Button>
          </EventClick>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormValues({ name: '', unit: '', increment: 0, total: 0 })
            }
          >
            Clear
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
