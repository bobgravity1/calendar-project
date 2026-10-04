import { create } from 'zustand'

type View = {
    name: 'calendar' | 'stats' | 'tasks'
}

export const views = ['calendar', 'stats', 'tasks'] as const;

export type ViewName = typeof views[number]

type ViewStore = {
    view: View['name']
    setView: (newView: View) => void
}

const useView = create<ViewStore>((set) => ({
    view: 'calendar',
    setView: (newView) =>
        set({ view: newView.name }),
}))

export default useView;
