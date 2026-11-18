import { create } from 'zustand'

interface SidebarState {
  expanded: boolean
  toggle: () => void
  setExpanded: (v: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  expanded: localStorage.getItem('nodes-sidebar') === 'expanded',
  toggle: () =>
    set((s) => {
      const next = !s.expanded
      localStorage.setItem('nodes-sidebar', next ? 'expanded' : 'collapsed')
      return { expanded: next }
    }),
  setExpanded: (v) => {
    localStorage.setItem('nodes-sidebar', v ? 'expanded' : 'collapsed')
    set({ expanded: v })
  },
}))
