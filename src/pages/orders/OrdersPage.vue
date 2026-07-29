<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <ClipboardDocumentListIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Orders</h3>
      <p class="text-sm">View and manage orders for your shop.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Orders', icon: ClipboardDocumentListIcon }])
</script>
