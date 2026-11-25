<template>
  <div class="max-w-3xl mx-auto py-4">
    <div class="card overflow-hidden">
      <!-- Status Header -->
      <div class="px-6 py-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        :style="{
          borderColor: 'var(--border-light)',
          backgroundColor: statusTone.bg
        }">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: statusTone.iconBg, color: statusTone.color }">
            <component :is="statusConfig.icon" class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-lg font-extrabold" :style="{ color: 'var(--text-primary)' }">
                {{ statusConfig.title }}
              </h1>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                :style="{ backgroundColor: statusTone.iconBg, color: statusTone.color }">
                {{ auth.shopStatus }}
              </span>
            </div>
            <p class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">
              {{ statusConfig.subtitle }}
            </p>
          </div>
        </div>

        <button @click="refreshStatus" :disabled="checking"
          class="btn-ghost text-xs shrink-0 flex items-center gap-1.5 self-start sm:self-center">
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': checking }" />
          {{ checking ? 'Checking...' : 'Check Status' }}
        </button>
      </div>

      <!-- Shop Context & Admin Reason -->
      <div class="p-6 space-y-6">
        <div class="flex items-center gap-4 p-4 rounded-xl border"
          :style="{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg)' }">
          <img v-if="auth.shop?.logo_url" :src="auth.shop.logo_url" :alt="auth.shopName"
            class="w-12 h-12 rounded-xl object-cover border shrink-0" :style="{ borderColor: 'var(--border)' }" />
          <div v-else class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
            :style="{ backgroundColor: 'var(--color-primary)' }">
            {{ auth.shopName.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-bold text-sm truncate" :style="{ color: 'var(--text-primary)' }">{{ auth.shopName }}</p>
            <p class="text-xs truncate" :style="{ color: 'var(--text-muted)' }">
              {{ auth.shop?.email || auth.userEmail }}
              <span v-if="auth.shop?.slug"> · /shops/{{ auth.shop.slug }}</span>
            </p>
          </div>
        </div>

        <!-- Reason / Reviewer Note -->
        <div v-if="auth.rejectionReason"
          class="rounded-xl p-4 border flex items-start gap-3"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--danger) 8%, transparent)',
            borderColor: 'color-mix(in srgb, var(--danger) 25%, transparent)'
          }">
          <ExclamationTriangleIcon class="w-5 h-5 shrink-0 mt-0.5" :style="{ color: 'var(--danger)' }" />
          <div>
            <p class="text-xs font-bold uppercase tracking-wide" :style="{ color: 'var(--danger)' }">
              {{ auth.shopStatus === 'suspended' ? 'Suspension Reason' : (auth.shopStatus === 'rejected' ? 'Rejection Reason' : 'Reviewer Note') }}
            </p>
            <p class="text-sm mt-1 leading-relaxed" :style="{ color: 'var(--text-primary)' }">
              {{ auth.rejectionReason }}
            </p>
          </div>
        </div>

        <!-- What this means -->
        <div class="rounded-xl p-4 border space-y-2"
          :style="{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface)' }">
          <h3 class="text-xs font-bold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">
            What happens while your shop is {{ auth.shopStatus }}?
          </h3>
          <ul class="space-y-1.5 text-sm" :style="{ color: 'var(--text-secondary)' }">
            <li class="flex items-start gap-2">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: 'var(--text-muted)' }"></span>
              <span>Storefront listings and new customer orders are temporarily paused.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: 'var(--text-muted)' }"></span>
              <span>Your existing product catalog, order history, and wallet balance remain preserved.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: 'var(--text-muted)' }"></span>
              <span>You can still submit or update KYC verification documents and contact Seller Support below.</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t"
          :style="{ borderColor: 'var(--border-light)' }">
          <div class="flex flex-wrap items-center gap-3">
            <router-link to="/settings/documents" class="btn-primary text-sm">
              <DocumentCheckIcon class="w-4 h-4" />
              Manage KYC Documents
            </router-link>
            <router-link to="/support" class="btn-ghost text-sm border" :style="{ borderColor: 'var(--border)' }">
              <QuestionMarkCircleIcon class="w-4 h-4" />
              Contact Support
            </router-link>
          </div>

          <button @click="auth.logout()" class="btn-ghost text-sm" :style="{ color: 'var(--danger)' }">
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import {
  ClockIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const checking = ref(false)

const statusConfig = computed(() => {
  switch (auth.shopStatus) {
    case 'suspended':
      return {
        icon: NoSymbolIcon,
        title: 'Shop Account Suspended',
        subtitle: 'Operations on your shop have been temporarily paused by the marketplace administrator.',
      }
    case 'rejected':
      return {
        icon: ExclamationTriangleIcon,
        title: 'Application Not Approved',
        subtitle: 'Please review the reason below, update your KYC documents, or reach out to Seller Support.',
      }
    default:
      return {
        icon: ClockIcon,
        title: 'Shop Under Verification',
        subtitle: 'Your shop is currently pending admin review. Once approved, full seller tools will unlock automatically.',
      }
  }
})

const statusTone = computed(() => {
  const isDanger = auth.shopStatus === 'suspended' || auth.shopStatus === 'rejected'
  const colorVar = isDanger ? 'var(--danger)' : 'var(--warning)'
  return {
    color: colorVar,
    bg: `color-mix(in srgb, ${colorVar} 7%, var(--surface))`,
    iconBg: `color-mix(in srgb, ${colorVar} 16%, transparent)`,
  }
})

async function refreshStatus() {
  checking.value = true
  try {
    await auth.fetchMe()
    if (auth.isShopActive) {
      toast.success('Your shop is active! Redirecting to dashboard.')
      router.replace('/')
    } else {
      toast.info(`Current shop status: ${auth.shopStatus}`)
    }
  } finally {
    checking.value = false
  }
}
</script>
