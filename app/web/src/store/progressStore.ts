/**
 * User progress store — persisted in localStorage.
 * Tracks module completion, sub-bab completion, and canvas projects.
 * Fresh accounts start with everything at zero.
 */

const STORAGE_KEY = 'nodes-user-progress'

export interface SubBabProgress {
  [subBabIndex: number]: boolean
}

export interface ModuleProgress {
  /** Progress percentage 0-100 */
  progress: number
  /** Sub-bab completion map */
  subBabs: SubBabProgress
}

export interface CanvasProject {
  id: number
  name: string
  date: string
  color: string
  layers: unknown[]
}

export interface UserProgress {
  /** Module progress by module id */
  modules: Record<number, ModuleProgress>
  /** Streak data */
  streak: {
    current: number
    lastLoginDate: string
    weekDays: boolean[] // 7 days, Mon-Sun
  }
  /** Canvas projects */
  canvasProjects: CanvasProject[]
  /** Activity timeline */
  activities: { text: string; time: string; color: string }[]
}

function getDefaultProgress(): UserProgress {
  return {
    modules: {},
    streak: {
      current: 0,
      lastLoginDate: '',
      weekDays: [false, false, false, false, false, false, false],
    },
    canvasProjects: [],
    activities: [],
  }
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...getDefaultProgress(), ...JSON.parse(raw) }
    }
  } catch {
    // ignore corrupt data
  }
  return getDefaultProgress()
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getModuleStatus(progress: UserProgress, moduleId: number, _totalModules: number): 'done' | 'progress' | 'available' | 'locked' {
  const mp = progress.modules[moduleId]

  // Module 1 is always available
  if (moduleId === 1) {
    if (mp && mp.progress >= 100) return 'done'
    if (mp && mp.progress > 0) return 'progress'
    return 'available'
  }

  // Check if previous module is done (sequential unlock)
  const prevModule = progress.modules[moduleId - 1]
  if (!prevModule || prevModule.progress < 100) {
    return 'locked'
  }

  // Previous is done, so this module is available
  if (mp && mp.progress >= 100) return 'done'
  if (mp && mp.progress > 0) return 'progress'
  return 'available'
}

export function getModuleProgress(progress: UserProgress, moduleId: number): number {
  return progress.modules[moduleId]?.progress ?? 0
}

export function getTotalProgress(progress: UserProgress, totalModules: number): { done: number; inProgress: number; notStarted: number; pct: number } {
  let done = 0
  let inProgress = 0

  for (let i = 1; i <= totalModules; i++) {
    const mp = progress.modules[i]
    if (mp && mp.progress >= 100) done++
    else if (mp && mp.progress > 0) inProgress++
  }

  return {
    done,
    inProgress,
    notStarted: totalModules - done - inProgress,
    pct: Math.round((done / totalModules) * 100),
  }
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0]
  if (progress.streak.lastLoginDate === today) return progress

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const isConsecutive = progress.streak.lastLoginDate === yesterday

  const newStreak = { ...progress.streak }
  newStreak.current = isConsecutive ? newStreak.current + 1 : 1
  newStreak.lastLoginDate = today

  // Update weekday (0=Mon, 6=Sun)
  const dayIndex = (new Date().getDay() + 6) % 7 // Convert Sun=0 to Mon=0
  newStreak.weekDays = [...newStreak.weekDays]
  newStreak.weekDays[dayIndex] = true

  // Reset days that are more than 7 days old
  if (!isConsecutive && progress.streak.lastLoginDate !== '') {
    newStreak.weekDays = [false, false, false, false, false, false, false]
    newStreak.weekDays[dayIndex] = true
  }

  return { ...progress, streak: newStreak }
}

export function markSubBabComplete(progress: UserProgress, moduleId: number, subBabIndex: number, totalSubs: number): UserProgress {
  const existing = progress.modules[moduleId] || { progress: 0, subBabs: {} }
  const newSubBabs = { ...existing.subBabs, [subBabIndex]: true }

  // Calculate progress
  const completedCount = Object.values(newSubBabs).filter(Boolean).length
  const newProgress = Math.round((completedCount / totalSubs) * 100)

  return {
    ...progress,
    modules: {
      ...progress.modules,
      [moduleId]: { progress: newProgress, subBabs: newSubBabs },
    },
  }
}

export function addActivity(progress: UserProgress, text: string, color: string = 'bg-teal-600'): UserProgress {
  const timeStr = 'Baru saja'
  const newActivities = [{ text, time: timeStr, color }, ...progress.activities].slice(0, 20)
  return { ...progress, activities: newActivities }
}
