import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProfileStore = create(
  persist(
    (set) => ({
      profile: null,
      onboardingComplete: false,

      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    {
      name: 'aarogya-profile',
    }
  )
)
