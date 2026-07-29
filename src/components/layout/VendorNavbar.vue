<template>
  <header class="navbar h-16 flex items-center px-4 lg:px-6 gap-2 shrink-0"
    :style="{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--navbar-border)' }">

    <button @click="$emit('toggle-sidebar')"
      class="navbar-btn p-2 rounded-lg transition"
      :style="{ color: 'var(--navbar-text)' }">
      <Bars3Icon class="w-5 h-5" />
    </button>

    <h1 class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ pageTitle }}</h1>

    <div class="ml-auto flex items-center gap-1">
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
            <router-link to="/settings"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
              :style="{ color: 'var(--navbar-text)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
              @click="isProfileDropdownOpen = false">
              <Cog6ToothIcon class="w-4 h-4" />
              Shop Settings
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
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  Bars3Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const auth = useAuthStore()
const theme = useThemeStore()

const isThemeOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const themeSwitcherRef = ref(null)
const profileDropdownRef = ref(null)

const currentThemeColor = computed(() => {
  return theme.themes.find(t => t.id === theme.colorTheme)?.color || '#2E7D32'
})

const pageRoutes = {
  '/': 'Dashboard',
  '/products': 'All Products',
  '/products/create': 'New Product',
  '/orders': 'Orders',
  '/inventory': 'Stock Overview',
  '/inventory/logs': 'Stock History',
  '/coupons': 'Coupons',
  '/reviews': 'Reviews',
  '/wallet': 'Wallet',
  '/wallet/payouts': 'Payouts',
  '/wallet/transactions': 'Transactions',
  '/shipping': 'Shipments',
  '/shipping/pickups': 'Pickups',
  '/support': 'Support Tickets',
  '/settings': 'Shop Settings',
  '/settings/bank': 'Bank Account',
  '/settings/staff': 'Staff Management',
}

const pageTitle = computed(() => {
  for (const [path, title] of Object.entries(pageRoutes)) {
    if (route.path.startsWith(path)) return title
  }
  return 'Dashboard'
})

function toggleProfileDropdown() {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
  if (isProfileDropdownOpen.value) isThemeOpen.value = false
}

function handleClickOutside(e) {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) isProfileDropdownOpen.value = false
  if (themeSwitcherRef.value && !themeSwitcherRef.value.contains(e.target)) isThemeOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
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
