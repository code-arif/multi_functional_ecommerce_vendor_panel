<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <ClipboardDocumentListIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Order #{{ $route.params.id }}</h3>
      <p class="text-sm">Order detail view will be built in Phase 4.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const breadcrumbItems = computed(() => [
  { label: 'Orders', to: '/orders' },
  { label: `Order #${route.params.id}` },
])
</script>
