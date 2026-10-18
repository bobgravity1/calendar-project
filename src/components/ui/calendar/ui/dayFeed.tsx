import React, { useContext } from 'react'
import { Card } from '../../card'
import { UserContext } from '@/App'
import { DayChart } from './dayChart'
import { DayTable } from './dayTable'

const cardStyles = `h-38 w-full px-6 text-primary py-4 rounded-xl border-primary/80`

export const DayFeed = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error(`context not found`)
  const { user, dispatch } = context

  return (
    <section className="grid grid-cols-2 justify-items-center gap-4 mx-6 mt-6 mb-8 place-items-center">
      <DayTable user={user} dispatch={dispatch} />
      <DayChart user={user} dispatch={dispatch} />
      <Card className={cardStyles} variant="glass-dark">
        News Feed
      </Card>
      <Card className={cardStyles} variant="glass-dark">
        News Feed
      </Card>
    </section>
  )
}
