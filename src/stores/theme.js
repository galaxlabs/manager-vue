import { defineStore } from 'pinia'

const THEME_KEY = 'manager_theme'
const DEFAULT_THEME = 'gledger'

const THEMES = {
  gledger: { label: 'Gledger (Neutral)', icon: '🎯' },
  daftra: { label: 'Daftra (Green)', icon: '🌿' },
  gtdispatch: { label: 'GT Dispatch (Warm)', icon: '🔥' },
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME
  } catch { return DEFAULT_THEME }
}

function saveTheme(t) {
  localStorage.setItem(THEME_KEY, t)
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: loadTheme(),
  }),
  getters: {
    themeList: () => Object.entries(THEMES).map(([id, t]) => ({ id, ...t })),
    themeLabel: (state) => THEMES[state.current]?.label || state.current,
  },
  actions: {
    setTheme(id) {
      if (!THEMES[id]) return
      this.current = id
      saveTheme(id)
      document.documentElement.setAttribute('data-theme', id)
    },
    init() {
      document.documentElement.setAttribute('data-theme', this.current)
    },
  },
})
