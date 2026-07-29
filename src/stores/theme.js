import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'vendor_color_theme'
  const colorTheme = ref(localStorage.getItem(STORAGE_KEY) || 'default')

  let transitionTimer = null
  let isFirstApply = true

  function applyTheme() {
    const root = document.documentElement
    if (!isFirstApply) root.classList.add('theme-transitioning')
    isFirstApply = false
    root.setAttribute('data-theme', colorTheme.value)
    clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 400)
  }

  function setColorTheme(theme) {
    colorTheme.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme()
  }

  const themes = [
    { id: 'default',   label: 'Default',   color: '#2E7D32', light: '#E8F5E9' },
    { id: 'tint',      label: 'Tint',      color: '#2563EB', light: '#DBEAFE' },
    { id: 'dark-aqua', label: 'Dark Aqua', color: '#0D9488', light: '#CCFBF1' },
    { id: 'royal',     label: 'Royal',     color: '#7C3AED', light: '#EDE9FE' },
    { id: 'crimson',   label: 'Crimson',   color: '#DC2626', light: '#FEE2E2' },
    { id: 'amber',     label: 'Amber',     color: '#D97706', light: '#FEF3C7' },
    { id: 'rose',      label: 'Rose',      color: '#E11D48', light: '#FFE4E6' },
    { id: 'indigo',    label: 'Indigo',    color: '#6366F1', light: '#E0E7FF' },
  ]

  applyTheme()

  return { colorTheme, themes, setColorTheme }
})
