import { create } from 'zustand'

export const useRecipeStore = create((set) => ({
  savedRecipes: [],
  filters: {
    mealType: [],
    dietType: [],
    region: [],
    healthTags: [],
    calorieRange: [0, 1000],
    prepTime: null,
    season: null,
    festival: null,
    sort: 'health_score',
  },
  searchQuery: '',

  toggleSave: (recipeId) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.includes(recipeId)
        ? state.savedRecipes.filter((id) => id !== recipeId)
        : [...state.savedRecipes, recipeId],
    })),
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  resetFilters: () =>
    set({
      filters: {
        mealType: [],
        dietType: [],
        region: [],
        healthTags: [],
        calorieRange: [0, 1000],
        prepTime: null,
        season: null,
        festival: null,
        sort: 'health_score',
      },
      searchQuery: '',
    }),
}))
