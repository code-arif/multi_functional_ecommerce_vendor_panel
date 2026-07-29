<template>
  <aside :class="[
    'sidebar fixed inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col lg:relative',
    sidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'
  ]">
    <!-- Logo -->
    <div class="sidebar-logo h-16 flex items-center px-4 gap-3 shrink-0">
      <div class="logo-icon w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 text-white">
        {{ auth.shopName?.charAt(0)?.toUpperCase() || 'S' }}
      </div>
      <div v-if="sidebarOpen" class="min-w-0 flex-1">
        <p class="sidebar-brand font-black text-lg leading-none truncate">{{ auth.shopName }}</p>
        <p class="sidebar-subtitle text-[11px]">Vendor Panel</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      <template v-for="group in navGroups" :key="group.name">
        <!-- Direct Link -->
        <router-link v-if="group.direct" :to="group.to"
          class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition relative group"
          :class="isActive(group.to) ? 'sidebar-nav-active' : ''">
          <component :is="group.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">{{ group.name }}</span>
          <div v-if="!sidebarOpen"
            class="sidebar-tooltip absolute left-full ml-3 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
            {{ group.name }}
          </div>
        </router-link>

        <!-- Dropdown Group -->
        <div v-else class="space-y-1">
          <button @click="toggleGroup(group.name)"
            class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition relative group">
            <component :is="group.icon" class="w-5 h-5 shrink-0 sidebar-nav-icon" />
            <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">{{ group.name }}</span>
            <ChevronDownIcon v-if="sidebarOpen" class="w-4 h-4 sidebar-chevron transition-transform"
              :class="openGroups[group.name] ? 'rotate-180' : ''" />
            <div v-if="!sidebarOpen"
              class="sidebar-tooltip absolute left-full ml-3 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
              {{ group.name }}
            </div>
          </button>

          <transition name="slide">
            <div v-if="openGroups[group.name] && sidebarOpen"
              class="sidebar-subnav ml-4 pl-3 space-y-1 overflow-hidden">
              <router-link v-for="item in group.items" :key="item.name" :to="item.to"
                class="sidebar-nav-item router-link-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
                :class="isActive(item.to) ? 'sidebar-nav-active' : ''">
                <component :is="item.icon" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ item.name }}</span>
              </router-link>
            </div>
          </transition>
        </div>
      </template>
    </nav>

    <!-- User Section -->
    <div class="sidebar-user-section p-3 shrink-0">
      <div class="flex items-center gap-3">
        <div class="sidebar-user-avatar w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 text-white">
          {{ auth.userName.charAt(0).toUpperCase() }}
        </div>
        <div v-if="sidebarOpen" class="flex-1 min-w-0">
          <p class="sidebar-user-name text-sm font-semibold truncate">{{ auth.userName }}</p>
          <p class="sidebar-user-email text-xs truncate">{{ auth.userEmail }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  TicketIcon,
  StarIcon,
  WalletIcon,
  TruckIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  BanknotesIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'

defineProps({ sidebarOpen: { type: Boolean, required: true } })

const route = useRoute()
const auth = useAuthStore()

const STORAGE_KEY = 'vendor_sidebar_groups'
const openGroups = reactive({})

const navGroups = [
  {
    name: 'Dashboard', icon: Squares2X2Icon,
    direct: true, to: '/',
  },
  {
    name: 'Products', icon: ShoppingBagIcon,
    items: [
      { name: 'All Products', to: '/products', icon: ShoppingBagIcon },
      { name: 'Add Product', to: '/products/create', icon: ShoppingBagIcon },
    ],
  },
  {
    name: 'Orders', icon: ClipboardDocumentListIcon,
    direct: false,
    items: [
      { name: 'All Orders', to: '/orders', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    name: 'Inventory', icon: ArchiveBoxIcon,
    items: [
      { name: 'Stock Overview', to: '/inventory', icon: ArchiveBoxIcon },
      { name: 'Stock History', to: '/inventory/logs', icon: ArrowPathIcon },
    ],
  },
  {
    name: 'Coupons', icon: TicketIcon,
    direct: true, to: '/coupons',
  },
  {
    name: 'Reviews', icon: StarIcon,
    direct: true, to: '/reviews',
  },
  {
    name: 'Finance', icon: WalletIcon,
    items: [
      { name: 'Wallet', to: '/wallet', icon: WalletIcon },
      { name: 'Payouts', to: '/wallet/payouts', icon: CurrencyDollarIcon },
      { name: 'Transactions', to: '/wallet/transactions', icon: BanknotesIcon },
    ],
  },
  {
    name: 'Shipping', icon: TruckIcon,
    items: [
      { name: 'Shipments', to: '/shipping', icon: TruckIcon },
      { name: 'Pickups', to: '/shipping/pickups', icon: TruckIcon },
    ],
  },
  {
    name: 'Support', icon: QuestionMarkCircleIcon,
    direct: true, to: '/support',
  },
  {
    name: 'Settings', icon: Cog6ToothIcon,
    items: [
      { name: 'Shop Profile', to: '/settings', icon: BuildingStorefrontIcon },
      { name: 'Bank Account', to: '/settings/bank', icon: BanknotesIcon },
      { name: 'Staff', to: '/settings/staff', icon: UserGroupIcon },
    ],
  },
]

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups))
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const groupNames = navGroups.filter(g => !g.direct).map(g => g.name)
      for (const name of groupNames) {
        if (typeof parsed[name] === 'boolean') openGroups[name] = parsed[name]
      }
      return true
    }
  } catch {}
  return false
}

function initializeGroups() {
  if (loadState()) return
  navGroups.filter(g => !g.direct).forEach(group => {
    openGroups[group.name] = group.items.some(item => route.path.startsWith(item.to))
  })
  saveState()
}

initializeGroups()

function toggleGroup(name) {
  openGroups[name] = !openGroups[name]
  saveState()
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path
}
</script>

<style scoped>
.sidebar {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--sidebar-border);
}
.sidebar-logo { border-bottom: 1px solid var(--sidebar-border); }
.logo-icon { background-color: var(--sidebar-logo-bg); }
.sidebar-brand { color: var(--sidebar-text); }
.sidebar-subtitle { color: var(--sidebar-text-muted); }
.sidebar-nav-item { color: var(--sidebar-text); }
.sidebar-nav-item:hover { background-color: var(--sidebar-hover); color: var(--sidebar-text); }
.sidebar-nav-active { background-color: var(--sidebar-active-bg) !important; color: var(--sidebar-active-text) !important; }
.sidebar-nav-icon { color: var(--sidebar-text); }
.sidebar-chevron { color: var(--sidebar-text-muted); }
.sidebar-subnav { border-left: 1px solid var(--sidebar-border); }
.sidebar-tooltip { background-color: var(--sidebar-hover); color: var(--sidebar-text); }
.sidebar-user-section { border-top: 1px solid var(--sidebar-border); }
.sidebar-user-avatar { background-color: var(--sidebar-logo-bg); }
.sidebar-user-name { color: var(--sidebar-text); }
.sidebar-user-email { color: var(--sidebar-text-muted); }

.slide-enter-active { transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; overflow: hidden; }
.slide-leave-active { transition: max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 500px; }
.slide-enter-active .router-link-item { animation: slideInChild 0.3s both; }
.slide-leave-active .router-link-item { animation: slideOutChild 0.15s both; }
.router-link-item:nth-child(1) { animation-delay: 0ms; }
.router-link-item:nth-child(2) { animation-delay: 20ms; }
.router-link-item:nth-child(3) { animation-delay: 40ms; }
.router-link-item:nth-child(4) { animation-delay: 60ms; }
.router-link-item:nth-child(5) { animation-delay: 80ms; }
@keyframes slideInChild { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideOutChild { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-8px); } }
</style>
