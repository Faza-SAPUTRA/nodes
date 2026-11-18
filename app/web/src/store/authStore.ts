import { create } from 'zustand'

interface AuthState {
  user: { name: string; initials: string; email: string; role: string } | null
  login: (name: string, email: string) => void
  logout: () => void
}

const defaultUser = { name: 'Andi Prasetyo', initials: 'AP', email: 'andi@iti.ac.id', role: 'Mahasiswa' }

export const useAuthStore = create<AuthState>((set) => ({
  user: defaultUser,
  login: (name, email) => {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    set({ user: { name, initials, email, role: 'Mahasiswa' } })
  },
  logout: () => set({ user: null }),
}))
