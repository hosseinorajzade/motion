// Tiny progress tracker for the loading screen.
// Each task counts for an equal share of the progress bar.

type Listener = (progress: number) => void

const tasks = new Map<string, boolean>()
const listeners = new Set<Listener>()

const progress = () => {
  if (tasks.size === 0) return 1
  let done = 0
  tasks.forEach((v) => v && done++)
  return done / tasks.size
}

const emit = () => listeners.forEach((l) => l(progress()))

export function addTask(key: string) {
  if (!tasks.has(key)) tasks.set(key, false)
  emit()
}

export function completeTask(key: string) {
  tasks.set(key, true)
  emit()
}

export function onProgress(listener: Listener) {
  listeners.add(listener)
  listener(progress())
  return () => {
    listeners.delete(listener)
  }
}
