<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <StarIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Reviews</h3>
      <p class="text-sm">View and respond to product reviews.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { StarIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Reviews', icon: StarIcon }])
</script>
