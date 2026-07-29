<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <QuestionMarkCircleIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Ticket #{{ $route.params.id }}</h3>
      <p class="text-sm">Ticket detail view will be built in Phase 8.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const breadcrumbItems = computed(() => [
  { label: 'Support', to: '/support' },
  { label: `Ticket #${route.params.id}` },
])
</script>
