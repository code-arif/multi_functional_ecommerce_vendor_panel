<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <ShoppingBagIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">{{ isEdit ? 'Edit Product' : 'Add Product' }}</h3>
      <p class="text-sm">Product form will be built in Phase 3.</p>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const breadcrumbItems = computed(() => [
  { label: 'Products', to: '/products' },
  { label: isEdit.value ? 'Edit Product' : 'Add Product' },
])
</script>
