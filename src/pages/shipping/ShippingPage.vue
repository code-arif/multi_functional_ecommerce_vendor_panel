<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <TruckIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Shipments</h3>
      <p class="text-sm">Track and manage your shipments and deliveries.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { TruckIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Shipping', icon: TruckIcon }])
</script>
