import { create } from 'zustand';
import type { User } from '@/types/user'

type FeatureView = {
    view: 'year' | 'month' | 'day',
    showWeather: boolean,
    showTasks: boolean,
    setCalendarView: (view: FeatureView['view']) => void
}

export const useCalendarStore = create<FeatureView>((set) => ({
    view: 'month',
    showWeather: false,
    showTasks: false,
    setCalendarView: (view) => set(() => ({
        view
    }))
}))
