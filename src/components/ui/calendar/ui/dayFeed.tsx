import React, { useContext } from 'react'
import { UserContext } from '@/App'
import { DayChart } from './dayChart'
import { DayTable } from './dayTable'

export const DayFeed = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error(`context not found`)
  const { user, dispatch } = context

  return (
    <section className="grid min-h-0 min-w-0 flex-1 grid-cols-1 items-stretch gap-4 mx-3 mt-4 mb-6 sm:mx-6 sm:mt-6 sm:mb-8 lg:grid-cols-2">
      <DayTable user={user} dispatch={dispatch} />
      <DayChart user={user} dispatch={dispatch} />
    </section>
  )
}
