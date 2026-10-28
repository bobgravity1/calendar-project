import React, { useContext } from 'react'
import { UserContext } from '@/App'
import { DayChart } from './dayChart'
import { DayTable } from './dayTable'

export const DayFeed = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error(`context not found`)
  const { user, dispatch } = context

  return (
    <section className="grid min-h-0 flex-1 grid-cols-2 justify-items-center gap-4 mx-6 mt-6 mb-8">
      <DayTable user={user} dispatch={dispatch} />
      <DayChart user={user} dispatch={dispatch} />
    </section>
  )
}
