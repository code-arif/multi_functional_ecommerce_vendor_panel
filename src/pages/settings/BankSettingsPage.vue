<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <BanknotesIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Bank Account</h3>
      <p class="text-sm">Manage your bank account details for payouts.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { BanknotesIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
  { label: 'Settings', to: '/settings' },
  { label: 'Bank Account' },
])
</script>
