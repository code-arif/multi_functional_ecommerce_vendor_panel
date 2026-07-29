<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <BuildingStorefrontIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Shop Settings</h3>
      <p class="text-sm">Update your shop profile, logo, description and contact info.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Settings', icon: BuildingStorefrontIcon }])
</script>
