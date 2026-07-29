import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const shortcuts = ref([])
  const pressedKeys = new Set()

  const defaultShortcuts = [
    { key: 'g+d', label: 'Dashboard', handler: () => router.push('/') },
    { key: 'g+o', label: 'Orders', handler: () => router.push('/orders') },
    { key: 'g+p', label: 'Products', handler: () => router.push('/products') },
    { key: 'g+i', label: 'Inventory', handler: () => router.push('/inventory') },
    { key: 'g+w', label: 'Wallet', handler: () => router.push('/wallet') },
    { key: 'Escape', label: 'Close / deselect', handler: () => document.activeElement?.blur() },
  ]

  function register(newShortcuts) {
    shortcuts.value = [...defaultShortcuts, ...newShortcuts]
  }

  function parseKeyCombo(combo) {
    return combo.split('+').map(k => k.trim().toLowerCase())
  }

  function matchCombo(combo, pressed) {
    return parseKeyCombo(combo).every(k => pressed.has(k))
  }

  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      if (e.key === 'Escape') e.target.blur()
      return
    }
    const key = e.key.toLowerCase()
    pressedKeys.add(key)

    for (const s of shortcuts.value) {
      if (!s.key.includes('+') && key === s.key.toLowerCase()) {
        e.preventDefault()
        s.handler()
        return
      }
    }
    for (const s of shortcuts.value) {
      if (s.key.includes('+') && matchCombo(s.key, pressedKeys)) {
        e.preventDefault()
        s.handler()
        pressedKeys.clear()
        return
      }
    }
  }

  function handleKeyup(e) {
    pressedKeys.delete(e.key.toLowerCase())
  }

  function registerAll() {
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keyup', handleKeyup)
    })
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keyup', handleKeyup)
    })
  }

  return { shortcuts, register, registerAll }
}
