import { flushSync } from 'react-dom'

let activeTransition: ViewTransition | undefined

export function runViewTransition(update: () => void, frame: 'calendar' | 'day' = 'calendar') {
  activeTransition?.skipTransition()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (typeof document.startViewTransition !== 'function' || reducedMotion) {
    update()
    return
  }

  document.documentElement.dataset.transitionFrame = frame
  const transition = document.startViewTransition(() => {
    flushSync(update)
  })
  activeTransition = transition
  void transition.finished.catch(() => {}).finally(() => {
    if (activeTransition === transition) {
      delete document.documentElement.dataset.transitionFrame
      activeTransition = undefined
    }
  })
}
