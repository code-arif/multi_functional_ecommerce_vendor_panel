import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, vendorApi } from '@/api'
import { useToast } from 'vue-toastification'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('vendor_user') || 'null'))
  const token = ref(localStorage.getItem('vendor_token') || null)
  const shop = ref(JSON.parse(localStorage.getItem('vendor_shop') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Vendor')
  const userEmail = computed(() => user.value?.email || '')
  const shopName = computed(() => shop.value?.shop_name || user.value?.vendor?.shop_name || 'My Shop')
  const shopStatus = computed(() => shop.value?.status || user.value?.vendor?.status || 'active')
  const isShopActive = computed(() => shopStatus.value === 'active')
  const rejectionReason = computed(() => shop.value?.rejection_reason ?? user.value?.vendor?.rejection_reason ?? '')

  function setAuthData(u, t, s) {
    user.value = u
    token.value = t
    shop.value = s || null
    localStorage.setItem('vendor_user', JSON.stringify(u))
    localStorage.setItem('vendor_token', t)
    if (s) localStorage.setItem('vendor_shop', JSON.stringify(s))
  }

  function setInactiveShopStatus(status, reason = null) {
    if (shop.value) {
      shop.value = { ...shop.value, status, rejection_reason: reason }
      localStorage.setItem('vendor_shop', JSON.stringify(shop.value))
    } else {
      shop.value = { status, rejection_reason: reason }
      localStorage.setItem('vendor_shop', JSON.stringify(shop.value))
    }
    if (user.value?.vendor) {
      user.value = {
        ...user.value,
        vendor: { ...user.value.vendor, status, rejection_reason: reason },
      }
      localStorage.setItem('vendor_user', JSON.stringify(user.value))
    }
  }

  function redirectAfterAuth(u, s) {
    const status = s?.status || u?.vendor?.status || 'active'
    if (status !== 'active') {
      useToast().warning(`Signed in — your shop is currently ${status}.`)
      router.push('/account-status')
    } else {
      useToast().success(`Welcome back, ${u.name}!`)
      router.push('/')
    }
  }

  async function login(credentials) {
    const res = await authApi.login(credentials)
    const { user: u, token: t, shop: s } = res.data.data
    setAuthData(u, t, s)
    redirectAfterAuth(u, s)
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
    redirectAfterAuth(u, s)
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

  function setShop(s) {
    shop.value = s || null
    if (s) {
      localStorage.setItem('vendor_shop', JSON.stringify(s))
    } else {
      localStorage.removeItem('vendor_shop')
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res.data.data
      localStorage.setItem('vendor_user', JSON.stringify(user.value))
      try {
        const profileRes = await vendorApi.profile()
        const shopData = profileRes.data?.data
        if (shopData) setShop(shopData)
      } catch {}
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
    shopStatus,
    isShopActive,
    rejectionReason,
    setShop,
    setInactiveShopStatus,
    login,
    sendOtp,
    verifyOtp,
    logout,
    fetchMe,
  }
})
