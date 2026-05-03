import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLearningStore = create(
  persist(
    (set, get) => ({
      learningPath: 'beginner',
      completedTopics: [],
      lastVisited: null,
      sidebarOpen: true,

      setLearningPath: (path) => set({ learningPath: path }),

      markTopicCompleted: (topicId) =>
        set((state) => ({
          completedTopics: state.completedTopics.includes(topicId)
            ? state.completedTopics
            : [...state.completedTopics, topicId],
        })),

      setLastVisited: (path) => set({ lastVisited: path }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      getProgress: () => {
        const { completedTopics } = get();
        const totalTopics = 40; // Total topics across all sections
        return Math.round((completedTopics.length / totalTopics) * 100);
      },

      isTopicCompleted: (topicId) => get().completedTopics.includes(topicId),
    }),
    {
      name: 'wireless-comms-progress',
    }
  )
);
