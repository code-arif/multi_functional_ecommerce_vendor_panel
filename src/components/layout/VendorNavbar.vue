<template>
  <header class="navbar h-16 flex items-center px-4 lg:px-6 gap-2 shrink-0"
    :style="{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--navbar-border)' }">

    <button @click="$emit('toggle-sidebar')"
      class="navbar-btn p-2 rounded-lg transition"
      :style="{ color: 'var(--navbar-text)' }">
      <Bars3Icon class="w-5 h-5" />
    </button>

    <h1 class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ pageTitle }}</h1>

    <router-link v-if="!auth.isShopActive" to="/account-status"
      class="ml-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
      :style="{
        backgroundColor: auth.shopStatus === 'pending' ? 'color-mix(in srgb, var(--warning) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 15%, transparent)',
        color: auth.shopStatus === 'pending' ? 'var(--warning)' : 'var(--danger)'
      }">
      {{ auth.shopStatus }}
    </router-link>

    <div class="ml-auto flex items-center gap-1">
      <!-- Notifications Dropdown -->
      <div class="relative" ref="notifDropdownRef">
        <button @click="toggleNotifDropdown"
          class="navbar-btn relative p-2 rounded-lg transition flex items-center justify-center"
          :style="{ backgroundColor: isNotifOpen ? 'var(--border-light)' : 'transparent', color: 'var(--navbar-text)' }"
          title="Notifications">
          <BellIcon class="w-5 h-5" />
          <span v-if="unreadCount > 0"
            class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            :style="{ backgroundColor: 'var(--danger)' }">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>

        <transition name="dropdown">
          <div v-if="isNotifOpen"
            class="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg border z-[80] overflow-hidden"
            :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-dropdown)' }">
            <div class="flex items-center justify-between px-4 py-3 border-b" :style="{ borderColor: 'var(--border)' }">
              <div>
                <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">Notifications</p>
                <p class="text-[11px]" :style="{ color: 'var(--text-muted)' }">
                  {{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}
                </p>
              </div>
              <button v-if="unreadCount > 0" @click="markAllAsRead"
                class="text-xs font-semibold hover:underline"
                :style="{ color: 'var(--color-primary)' }">
                Mark all read
              </button>
            </div>

            <div class="max-h-80 overflow-y-auto divide-y" :style="{ borderColor: 'var(--border-light)' }">
              <div v-if="notifLoading" class="p-6 text-center text-xs" :style="{ color: 'var(--text-muted)' }">
                Loading notifications...
              </div>
              <div v-else-if="notifications.length === 0" class="p-6 text-center text-xs" :style="{ color: 'var(--text-muted)' }">
                No notifications yet.
              </div>
              <div v-for="n in notifications" :key="n.id"
                @click="handleNotificationClick(n)"
                class="px-4 py-3 cursor-pointer transition flex items-start gap-3"
                :style="{ backgroundColor: n.read_at ? 'transparent' : 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }">
                <span class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  :style="{ backgroundColor: n.read_at ? 'transparent' : 'var(--color-primary)' }"></span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold truncate" :style="{ color: 'var(--text-primary)' }">
                    {{ n.title || n.data?.title || 'Notification' }}
                  </p>
                  <p class="text-xs mt-0.5 line-clamp-2" :style="{ color: 'var(--text-secondary)' }">
                    {{ n.message || n.data?.message || n.data?.body || '' }}
                  </p>
                  <p class="text-[10px] mt-1" :style="{ color: 'var(--text-muted)' }">
                    {{ formatNotifTime(n.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Theme Switcher -->
      <div class="relative" ref="themeSwitcherRef">
        <button @click="isThemeOpen = !isThemeOpen"
          class="navbar-btn p-2 rounded-lg transition flex items-center justify-center"
          :style="{ backgroundColor: isThemeOpen ? 'var(--border-light)' : 'transparent' }"
          @mouseenter="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'var(--border-light)' }"
          @mouseleave="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'transparent' }">
          <span class="w-[18px] h-[18px] rounded-full ring-2 ring-offset-1 transition-all"
            :style="{ backgroundColor: currentThemeColor, '--tw-ring-color': currentThemeColor }"></span>
        </button>

        <transition name="dropdown">
          <div v-if="isThemeOpen"
            class="absolute right-0 mt-2 w-[280px] rounded-xl shadow-lg border py-3 px-3 z-[80] overflow-hidden"
            :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-dropdown)' }">
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-muted)' }">
              Color Theme</p>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="t in theme.themes" :key="t.id"
                @click="theme.setColorTheme(t.id)"
                class="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all"
                :class="theme.colorTheme === t.id ? 'ring-2 shadow-sm' : 'opacity-75 hover:opacity-100'"
                :style="{ backgroundColor: theme.colorTheme === t.id ? t.light : 'transparent', '--tw-ring-color': t.color, color: theme.colorTheme === t.id ? t.color : 'var(--navbar-text)' }">
                <span class="w-6 h-6 rounded-full" :style="{ backgroundColor: t.color }"></span>
                <span class="text-[10px] font-medium truncate w-full text-center">{{ t.label }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Profile Dropdown -->
      <div class="relative" ref="profileDropdownRef">
        <button @click="toggleProfileDropdown"
          class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0 transition"
          :style="{ backgroundColor: 'var(--color-primary)', boxShadow: isProfileDropdownOpen ? '0 0 0 2px var(--color-primary)' : '0 0 0 2px var(--border)' }">
          {{ auth.userName.charAt(0).toUpperCase() }}
        </button>

        <transition name="dropdown">
          <div v-if="isProfileDropdownOpen"
            class="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-1 z-[80]"
            :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-dropdown)' }">
            <div class="px-4 py-3 border-b" :style="{ borderColor: 'var(--border)' }">
              <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">{{ auth.userName }}</p>
              <p class="text-xs truncate" :style="{ color: 'var(--text-muted)' }">{{ auth.userEmail }}</p>
            </div>
            <router-link :to="auth.isShopActive ? '/settings' : '/account-status'"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
              :style="{ color: 'var(--navbar-text)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
              @click="isProfileDropdownOpen = false">
              <Cog6ToothIcon class="w-4 h-4" />
              {{ auth.isShopActive ? 'Shop Settings' : 'Account Status' }}
            </router-link>
            <button @click="auth.logout()"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition border-t"
              :style="{ color: 'var(--danger)', borderTopColor: 'var(--border)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'color-mix(in srgb, var(--danger) 8%, transparent)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              <ArrowRightOnRectangleIcon class="w-4 h-4" />
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { notificationApi } from '@/api'
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()

const isNotifOpen = ref(false)
const isThemeOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const notifDropdownRef = ref(null)
const themeSwitcherRef = ref(null)
const profileDropdownRef = ref(null)
const notifications = ref([])
const unreadCount = ref(0)
const notifLoading = ref(false)

const currentThemeColor = computed(() => {
  return theme.themes.find(t => t.id === theme.colorTheme)?.color || '#2E7D32'
})

const pageRoutes = {
  '/account-status': 'Account Status',
  '/products/create': 'New Product',
  '/products': 'All Products',
  '/orders': 'Orders',
  '/inventory/logs': 'Stock History',
  '/inventory': 'Stock Overview',
  '/coupons': 'Coupons',
  '/reviews': 'Reviews',
  '/wallet/payouts': 'Payouts',
  '/wallet/transactions': 'Transactions',
  '/wallet': 'Wallet',
  '/shipping/pickups': 'Pickups',
  '/shipping': 'Shipments',
  '/support': 'Support Tickets',
  '/settings/documents': 'KYC Documents',
  '/settings/addresses': 'Shop Addresses',
  '/settings/bank': 'Payout Accounts',
  '/settings/staff': 'Staff Management',
  '/settings': 'Shop Settings',
  '/': 'Dashboard',
}

const pageTitle = computed(() => {
  if (pageRoutes[route.path]) return pageRoutes[route.path]
  const sorted = Object.entries(pageRoutes)
    .filter(([path]) => path !== '/')
    .sort((a, b) => b[0].length - a[0].length)
  for (const [path, title] of sorted) {
    if (route.path.startsWith(path)) return title
  }
  return 'Dashboard'
})

async function fetchNotifications(silent = true) {
  if (!auth.isLoggedIn) return
  if (!silent) notifLoading.value = true
  try {
    const res = await notificationApi.list({ per_page: 10 })
    notifications.value = res.data?.data || []
    unreadCount.value = res.data?.unread ?? 0
  } catch {
  } finally {
    notifLoading.value = false
  }
}

function toggleNotifDropdown() {
  isNotifOpen.value = !isNotifOpen.value
  if (isNotifOpen.value) {
    isThemeOpen.value = false
    isProfileDropdownOpen.value = false
    fetchNotifications(false)
  }
}

async function handleNotificationClick(n) {
  if (!n.read_at) {
    try {
      const res = await notificationApi.markAsRead(n.id)
      n.read_at = new Date().toISOString()
      unreadCount.value = res.data?.unread ?? Math.max(0, unreadCount.value - 1)
    } catch {}
  }
  const url = n.action_url || n.data?.action_url
  if (url && typeof url === 'string' && url.startsWith('/') && !url.startsWith('/vendor/')) {
    isNotifOpen.value = false
    router.push(url)
  }
}

async function markAllAsRead() {
  try {
    await notificationApi.markAllRead()
    notifications.value.forEach(n => { n.read_at = n.read_at || new Date().toISOString() })
    unreadCount.value = 0
  } catch {}
}

function formatNotifTime(dateStr) {
  if (!dateStr) return ''
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return new Date(dateStr).toLocaleDateString()
}

function toggleProfileDropdown() {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
  if (isProfileDropdownOpen.value) {
    isThemeOpen.value = false
    isNotifOpen.value = false
  }
}

function handleClickOutside(e) {
  if (notifDropdownRef.value && !notifDropdownRef.value.contains(e.target)) isNotifOpen.value = false
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) isProfileDropdownOpen.value = false
  if (themeSwitcherRef.value && !themeSwitcherRef.value.contains(e.target)) isThemeOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications(true)
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.navbar-btn { transition: background-color 0.15s ease, color 0.15s ease; }
.navbar-btn:hover { background-color: var(--border-light); }
.dropdown-enter-active { transition: all 0.18s ease-out; }
.dropdown-leave-active { transition: all 0.12s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px) scale(.96); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(.96); }
</style>
