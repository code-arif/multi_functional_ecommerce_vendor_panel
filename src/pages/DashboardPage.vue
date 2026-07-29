<template>
  <div>
    <!-- Welcome -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="page-title">{{ greeting }}, {{ auth.userName }}!</h1>
        <p class="text-sm" :style="{ color: 'var(--text-muted)' }">
          {{ auth.shopName }} — Here's what's happening today
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }">
          <CurrencyDollarIcon class="w-5 h-5" :style="{ color: 'var(--color-primary)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Revenue</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">৳0</p>
          <p class="text-[10px]" :style="{ color: 'var(--success)' }">+0% vs last month</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--info) 15%, transparent)' }">
          <ClipboardDocumentListIcon class="w-5 h-5" :style="{ color: 'var(--info)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Orders</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">0</p>
          <p class="text-[10px]" :style="{ color: 'var(--text-muted)' }">0 pending</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }">
          <ShoppingBagIcon class="w-5 h-5" :style="{ color: 'var(--warning)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Products</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">0</p>
          <p class="text-[10px]" :style="{ color: 'var(--text-muted)' }">0 out of stock</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }">
          <StarIcon class="w-5 h-5" :style="{ color: 'var(--success)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Rating</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">0.0</p>
          <p class="text-[10px]" :style="{ color: 'var(--text-muted)' }">0 reviews</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Recent Orders -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="card p-5">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">
          Quick Actions
        </h3>
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
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card overflow-hidden lg:col-span-2">
        <div class="flex items-center justify-between px-5 py-4 border-b"
          :style="{ borderColor: 'var(--border-light)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Recent Orders</h3>
          <router-link to="/orders" class="text-xs font-semibold"
            :style="{ color: 'var(--color-primary)' }">View All</router-link>
        </div>
        <div class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
          <ClipboardDocumentListIcon class="w-8 h-8 mx-auto mb-2" />
          No orders yet. Start selling!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  StarIcon,
  PlusIcon,
  ArchiveBoxIcon,
  WalletIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})
</script>
