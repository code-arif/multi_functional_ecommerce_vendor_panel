<template>
  <div class="flex h-screen overflow-hidden" :style="{ backgroundColor: 'var(--app-bg)' }">
    <VendorSidebar :sidebarOpen="sidebarOpen" />

    <div v-if="sidebarOpen" @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden" />

    <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
      <VendorNavbar
        :unreadCount="unreadCount"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VendorSidebar from '@/components/layout/VendorSidebar.vue'
import VendorNavbar from '@/components/layout/VendorNavbar.vue'

const SIDEBAR_STATE_KEY = 'vendor_sidebar_open'
const sidebarOpen = ref(localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false')
watch(sidebarOpen, val => localStorage.setItem(SIDEBAR_STATE_KEY, val))

const unreadCount = ref(0)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
