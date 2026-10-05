import { create } from 'zustand'

type Reminder = {
    name: string,
    date: Date,
    time: string
}