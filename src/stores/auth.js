import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { useToast } from 'vue-toastification'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('vendor_user') || 'null'))
  const token = ref(localStorage.getItem('vendor_token') || null)
  const shop = ref(JSON.parse(localStorage.getItem('vendor_shop') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Vendor')
  const userEmail = computed(() => user.value?.email || '')
  const shopName = computed(() => shop.value?.shop_name || 'My Shop')

  function setAuthData(u, t, s) {
    user.value = u
    token.value = t
    shop.value = s || null
    localStorage.setItem('vendor_user', JSON.stringify(u))
    localStorage.setItem('vendor_token', t)
    if (s) localStorage.setItem('vendor_shop', JSON.stringify(s))
  }

  async function login(credentials) {
    const res = await authApi.login(credentials)
    const { user: u, token: t, shop: s } = res.data.data
    setAuthData(u, t, s)
    useToast().success(`Welcome back, ${u.name}!`)
    router.push('/')
  }

  async function sendOtp(email) {
    const res = await authApi.sendOtp({ email })
    useToast().success(res.data.message || 'Verification code sent to your email.')
    return res.data
  }

  async function verifyOtp(email, code) {
    const res = await authApi.verifyOtp({ email, code })
    const { user: u, token: t, shop: s } = res.data.data
    setAuthData(u, t, s)
    useToast().success(`Welcome back, ${u.name}!`)
    router.push('/')
    return res.data
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {}
    user.value = null
    token.value = null
    shop.value = null
    localStorage.removeItem('vendor_user')
    localStorage.removeItem('vendor_token')
    localStorage.removeItem('vendor_shop')
    router.push('/login')
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res.data.data
      localStorage.setItem('vendor_user', JSON.stringify(user.value))
    } catch {
      logout()
    }
  }

  return {
    user,
    token,
    shop,
    isLoggedIn,
    userName,
    userEmail,
    shopName,
    login,
    sendOtp,
    verifyOtp,
    logout,
    fetchMe,
  }
})
