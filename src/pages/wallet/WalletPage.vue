<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <WalletIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Wallet</h3>
      <p class="text-sm">View your wallet balance, earnings, and request payouts.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { WalletIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Wallet', icon: WalletIcon }])
</script>
