<template>
  <div>
    <!-- Welcome -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="page-title">{{ greeting }}, {{ auth.userName }}!</h1>
        <p class="text-sm" :style="{ color: 'var(--text-muted)' }">
          <template v-if="profile">
            {{ profile.shop_name }} · {{ profile.status === 'active' ? 'Shop Active' : 'Pending Approval' }}
          </template>
          <span v-else-if="!hasError">Loading your dashboard...</span>
          <span v-else>Dashboard could not be loaded</span>
        </p>
      </div>
      <button @click="refresh"
        class="btn-ghost text-xs flex items-center gap-1.5"
        :disabled="loading">
        <ArrowPathIcon class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="hasError" class="card p-4 mb-4 flex items-center gap-3"
      :style="{ backgroundColor: 'color-mix(in srgb, var(--danger) 8%, var(--surface))', border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)' }">
      <ExclamationTriangleIcon class="w-5 h-5 shrink-0" :style="{ color: 'var(--danger)' }" />
      <div class="text-sm" :style="{ color: 'var(--text-primary)' }">
        <span class="font-semibold">Unable to load dashboard data.</span>
        <span class="ml-1">Click <strong>Refresh</strong> to try again.</span>
      </div>
    </div>

    <!-- Stats Cards (loading skeleton) -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 4" :key="i" class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg" :style="{ backgroundColor: 'var(--border-light)' }"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-16 rounded" :style="{ backgroundColor: 'var(--border-light)' }"></div>
          <div class="h-5 w-20 rounded" :style="{ backgroundColor: 'var(--border-light)' }"></div>
          <div class="h-2 w-14 rounded" :style="{ backgroundColor: 'var(--border-light)' }"></div>
        </div>
      </div>
    </div>

    <!-- Stats Cards (loaded) -->
    <div v-if="!loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }">
          <CurrencyDollarIcon class="w-5 h-5" :style="{ color: 'var(--color-primary)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Revenue</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">৳{{ formatNumber(wallet.total_earned) }}</p>
          <p class="text-[10px]" :style="{ color: 'var(--success)' }">
            ৳{{ formatNumber(wallet.monthly_earnings) }} this month
          </p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--info) 15%, transparent)' }">
          <ClipboardDocumentListIcon class="w-5 h-5" :style="{ color: 'var(--info)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Balance</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">৳{{ formatNumber(wallet.current_balance) }}</p>
          <p class="text-[10px]" :style="{ color: wallet.pending_payouts > 0 ? 'var(--warning)' : 'var(--text-muted)' }">
            {{ wallet.pending_payouts > 0 ? `৳${formatNumber(wallet.pending_payouts)} pending payout` : 'Available' }}
          </p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }">
          <ArchiveBoxIcon class="w-5 h-5" :style="{ color: 'var(--warning)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Inventory</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ inventory.product_count || '—' }}</p>
          <p class="text-[10px]" :style="{ color: inventory.low_stock_count > 0 ? 'var(--danger)' : 'var(--text-muted)' }">
            {{ inventory.low_stock_count > 0 ? `${inventory.low_stock_count} low in stock` : 'Stock OK' }}
          </p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }">
          <WalletIcon class="w-5 h-5" :style="{ color: 'var(--success)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Withdrawn</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">৳{{ formatNumber(wallet.total_withdrawn) }}</p>
          <p class="text-[10px]" :style="{ color: 'var(--text-muted)' }">Total withdrawn to date</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="card p-5">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Quick Actions</h3>
        <div class="space-y-2">
          <router-link to="/products/create"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
            :style="{ color: 'var(--navbar-text)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
            <PlusIcon class="w-4 h-4" :style="{ color: 'var(--color-primary)' }" />
            Add New Product
          </router-link>
          <router-link to="/orders"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
            :style="{ color: 'var(--navbar-text)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
            <ClipboardDocumentListIcon class="w-4 h-4" :style="{ color: 'var(--info)' }" />
            View Orders
          </router-link>
          <router-link to="/inventory"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
            :style="{ color: 'var(--navbar-text)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
            <ArchiveBoxIcon class="w-4 h-4" :style="{ color: 'var(--warning)' }" />
            Manage Stock
          </router-link>
          <router-link to="/wallet"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
            :style="{ color: 'var(--navbar-text)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
            <WalletIcon class="w-4 h-4" :style="{ color: 'var(--success)' }" />
            View Wallet
          </router-link>
          <router-link to="/settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
            :style="{ color: 'var(--navbar-text)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
            <Cog6ToothIcon class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
            Shop Settings
          </router-link>
        </div>
      </div>

      <!-- Right Panel: Recent Orders + Low Stock -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Recent Orders -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b"
            :style="{ borderColor: 'var(--border-light)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
              <ClipboardDocumentListIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--info)' }" />
              Recent Orders
            </h3>
            <router-link to="/orders" class="text-xs font-semibold"
              :style="{ color: 'var(--color-primary)' }">View All</router-link>
          </div>
          <div class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <ClipboardDocumentListIcon class="w-8 h-8 mx-auto mb-2" />
            No orders yet. Start selling!
          </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b"
            :style="{ borderColor: 'var(--border-light)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
              <ExclamationTriangleIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--warning)' }" />
              Low Stock Alerts
            </h3>
            <router-link to="/inventory" class="text-xs font-semibold"
              :style="{ color: 'var(--color-primary)' }">Manage Stock</router-link>
          </div>

          <div v-if="loading" class="p-6 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            Checking stock levels...
          </div>

          <div v-else-if="lowStockItems.length > 0" class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="item in lowStockItems.slice(0, 5)" :key="item.id"
              class="flex items-center gap-3 px-5 py-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">{{ item.product_name || item.name }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">SKU: {{ item.sku || '—' }}</p>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded"
                :style="{
                  color: item.stock <= 0 ? 'var(--danger)' : 'var(--warning)',
                  backgroundColor: item.stock <= 0 ? 'color-mix(in srgb, var(--danger) 15%, transparent)' : 'color-mix(in srgb, var(--warning) 15%, transparent)'
                }">
                {{ item.stock || 0 }} left
              </span>
            </div>
          </div>

          <div v-else class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <CheckCircleIcon class="w-8 h-8 mx-auto mb-2" :style="{ color: 'var(--success)' }" />
            All stock levels are healthy
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, financeApi, inventoryApi } from '@/api'
import { useToast } from 'vue-toastification'
import {
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  WalletIcon,
  PlusIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const toast = useToast()

const loading = ref(true)
const hasError = ref(false)
const profile = ref(null)
const wallet = reactive({
  current_balance: 0,
  total_earned: 0,
  total_withdrawn: 0,
  pending_payouts: 0,
  monthly_earnings: 0,
  available: 0,
})
const inventory = reactive({
  product_count: 0,
  low_stock_count: 0,
  out_of_stock_count: 0,
})
const lowStockItems = ref([])

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

function formatNumber(val) {
  return Number(val || 0).toLocaleString()
}

async function loadDashboard() {
  loading.value = true
  hasError.value = false

  const [profileRes, walletRes, inventoryRes, lowStockRes] = await Promise.allSettled([
    vendorApi.profile(),
    financeApi.wallet(),
    inventoryApi.summary(),
    inventoryApi.lowStock(),
  ])

  if (profileRes.status === 'fulfilled') {
    profile.value = profileRes.value.data.data || profileRes.value.data
  }

  if (walletRes.status === 'fulfilled') {
    const data = walletRes.value.data.data || walletRes.value.data
    Object.assign(wallet, {
      current_balance: data.current_balance || 0,
      total_earned: data.total_earned || 0,
      total_withdrawn: data.total_withdrawn || 0,
      pending_payouts: data.pending_payouts || 0,
      monthly_earnings: data.monthly_earnings || 0,
      available: data.available || 0,
    })
  }

  if (inventoryRes.status === 'fulfilled') {
    const data = inventoryRes.value.data.data || inventoryRes.value.data
    Object.assign(inventory, {
      product_count: data.product_count || data.total_products || 0,
      low_stock_count: data.low_stock_count || 0,
      out_of_stock_count: data.out_of_stock_count || 0,
    })
  }

  if (lowStockRes.status === 'fulfilled') {
    lowStockItems.value = lowStockRes.value.data.data || lowStockRes.value.data || []
  }

  // Fallback: if wallet failed but profile has balance data
  if (walletRes.status === 'rejected' && profile.value) {
    wallet.current_balance = profile.value.wallet_balance || 0
    wallet.total_earned = profile.value.total_earned || 0
    wallet.total_withdrawn = profile.value.total_withdrawn || 0
  }

  // Show error banner if ALL primary calls failed
  if (profileRes.status === 'rejected' && walletRes.status === 'rejected') {
    hasError.value = true
    toast.error('Could not load shop data. Check your connection.')
  }

  loading.value = false
}

function refresh() {
  loadDashboard()
}

onMounted(loadDashboard)
</script>
