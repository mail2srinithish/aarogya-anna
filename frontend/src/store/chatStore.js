import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      isTyping: false,
      sessionId: crypto.randomUUID(),

      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, { ...message, id: Date.now(), timestamp: new Date().toISOString() }] })),
      setTyping: (val) => set({ isTyping: val }),
      clearHistory: () => set({ messages: [], sessionId: crypto.randomUUID() }),
    }),
    {
      name: 'aarogya-chat',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
)
