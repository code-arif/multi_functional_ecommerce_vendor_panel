<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <ArrowPathIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Stock History</h3>
      <p class="text-sm">View all stock adjustments and inventory changes.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
  { label: 'Inventory', to: '/inventory' },
  { label: 'Stock History' },
])
</script>
