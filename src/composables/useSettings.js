import { reactive, ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { settingsApi } from '@/api'

export function useSettings(keys, label) {
  const toast = useToast()
  const form = reactive({})
  const saving = ref(false)
  const loading = ref(true)

  keys.forEach(k => form[k] = '')

  onMounted(async () => {
    try {
      const r = await settingsApi.list()
      const allSettings = Object.values(r.data.data).flat()
      allSettings.forEach(s => {
        if (keys.includes(s.key)) form[s.key] = s.value ?? ''
      })
    } catch { toast.error('Failed to load settings.') }
    finally { loading.value = false }
  })

  async function save(extraKeys = []) {
    saving.value = true
    try {
      const saveKeys = [...keys, ...extraKeys]
      const payload = { settings: Object.fromEntries(saveKeys.map(k => [k, form[k] ?? ''])) }
      await settingsApi.update(payload)
      toast.success(`${label} settings saved.`)
    } catch { toast.error(`Failed to save ${label} settings.`) }
    finally { saving.value = false }
  }

  return { form, saving, loading, save }
}
