export type LayerType = 'Frame' | 'Text' | 'Rectangle' | 'Ellipse' | 'Path'

export interface CanvasLayer {
  id: number
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  x: number
  y: number
  w: number
  h: number
  color: string
  text?: string
  fontSize?: number
  borderRadius?: number
  opacity?: number
  points?: { x: number; y: number }[]
}

export interface CanvasProject {
  id: number
  name: string
  date: string
  color: string
  layers: CanvasLayer[]
}

export interface CollabSession {
  id: string
  title: string
  projectId: number
  createdAt: string
}

export interface ChatMessage {
  id: string
  author: string
  avatar: string
  avatarBg: string
  text: string
  time: string
  self?: boolean
  system?: boolean
}

export interface CommentPin {
  id: number
  x: string
  y: string
  author: string
  avatarBg: string
  letter: string
  time: string
  text: string
  replies: { author: string; avatarBg: string; letter: string; time: string; text: string }[]
  resolved: boolean
}

export interface ActivityItem {
  id: number
  author: string
  avatarBg: string
  letter: string
  text: string
  time: string
}

export interface SessionCollabData {
  chat: ChatMessage[]
  pins: CommentPin[]
  activity: ActivityItem[]
  votes: { approve: boolean; revision: boolean }
  invitedEmails: string[]
}

export const ARTBOARD_W = 480
export const ARTBOARD_H = 400
export const CANVAS_STORAGE_KEY = 'nodes-canvas-projects'
export const COLLAB_SESSIONS_KEY = 'nodes-collab-sessions'

export function loadCanvasProjects(): CanvasProject[] {
  try {
    const saved = localStorage.getItem(CANVAS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return []
}

export function saveCanvasProjects(projects: CanvasProject[]): void {
  localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(projects))
}

export function loadCollabSessions(): CollabSession[] {
  try {
    const raw = localStorage.getItem(COLLAB_SESSIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return []
}

export function saveCollabSessions(sessions: CollabSession[]): void {
  localStorage.setItem(COLLAB_SESSIONS_KEY, JSON.stringify(sessions))
}

export function getDefaultSessionData(): SessionCollabData {
  return {
    chat: [{ id: '0', author: '', avatar: '', avatarBg: '', text: 'Sesi review dimulai — baru saja', time: '', system: true }],
    pins: [],
    activity: [],
    votes: { approve: false, revision: false },
    invitedEmails: [],
  }
}

export function loadSessionData(sessionId: string): SessionCollabData {
  try {
    const raw = localStorage.getItem(`nodes-collab-data-${sessionId}`)
    if (raw) {
      return { ...getDefaultSessionData(), ...JSON.parse(raw) }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return getDefaultSessionData()
}

export function saveSessionData(sessionId: string, data: SessionCollabData): void {
  localStorage.setItem(`nodes-collab-data-${sessionId}`, JSON.stringify(data))
}

export function removeSessionData(sessionId: string): void {
  localStorage.removeItem(`nodes-collab-data-${sessionId}`)
}

export function getUnresolvedPinCountForProject(projectId: number): number {
  const sessions = loadCollabSessions().filter(s => s.projectId === projectId)
  let total = 0
  for (const s of sessions) {
    const data = loadSessionData(s.id)
    total += data.pins.filter(p => !p.resolved).length
  }
  return total
}
