<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-8 text-center" :style="{ color: 'var(--text-muted)' }">
      <ShoppingBagIcon class="w-10 h-10 mx-auto mb-3" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Products</h3>
      <p class="text-sm">Manage your product catalog. Add, edit, and organize your products here.</p>
      <router-link to="/products/create" class="btn-primary mt-4 inline-flex">Add Product</router-link>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [{ label: 'Products', icon: ShoppingBagIcon }])
</script>
