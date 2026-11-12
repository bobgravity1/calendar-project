import { isToday } from 'date-fns'
import type { Record } from '@/types/user'

export const getRecordByTask = async (taskName: string, date?: string) => {
  let data

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/record/${taskName}${date ? `?date=${date}` : ''}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!response.ok) throw new Error('nothing found')
    data = await response.json()
  } catch (err) {
    throw new Error(`record search type incorrect: ${err}`)
  }
}

export const getRecords = async () => {
  let data
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/record`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    // backend sends 400 when there are no records yet — treat that as "none", not a crash
    if (!response.ok) return null
    data = await response.json()
  } catch (err) {
    throw new Error(`record not create: ${err}`)
  }
  if (!data) {
    return null
  }
  // backend wraps the array: { records: [...] }
  return data.records
}

export const writeRecord = async (record: Record) => {
  let data
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/record/add`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      },
    )

    if (!response.ok) throw new Error(`daily record write failure`)
    data = await response.json()
  } catch (err) {
    throw new Error(`record not create: ${err}`)
  }
  return data
}
