<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <Breadcrumb :items="breadcrumbItems" />
      <router-link :to="`/products/${product?.id}/edit`" class="btn-primary text-sm" v-if="product">
        Edit Pricing
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3">
        <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Loading product...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card p-12 text-center">
      <p class="text-4xl mb-3">⚠️</p>
      <p class="font-semibold" :style="{ color: 'var(--text-primary)' }">Failed to load product</p>
      <p class="text-sm mt-1 mb-4" :style="{ color: 'var(--text-muted)' }">{{ error }}</p>
      <button @click="load" class="btn-primary text-sm px-6">Try Again</button>
    </div>

    <!-- Content -->
    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Gallery -->
        <div class="card p-5">
          <div class="flex gap-4 items-start">
            <div class="flex-1 aspect-square rounded-xl overflow-hidden" :style="{ background: 'var(--border-light)' }">
              <img v-if="activeImage" :src="activeImage" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center"
                :style="{ color: 'var(--text-muted)' }">
                <ShoppingBagIcon class="w-10 h-10" />
              </div>
            </div>
            <div v-if="allImages.length > 1" class="flex flex-col gap-2 w-28 max-h-[630px] overflow-y-auto pr-1">
              <button v-for="(img, i) in allImages" :key="i" @click="activeImage = img.url"
                class="w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition"
                :style="{
                  borderColor: activeImage === img.url ? 'var(--color-primary)' : 'var(--border-color)',
                }">
                <img :src="img.url" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div>

        <!-- Basic info -->
        <div class="card p-5">
          <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Basic Information</h3>
          <div class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Product Name</p>
                <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ product.name }}</p>
              </div>
              <div>
                <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Type</p>
                <StatusBadge :value="product.type" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">SKU</p>
                <p class="font-mono" :style="{ color: 'var(--text-primary)' }">{{ product.sku || '—' }}</p>
              </div>
              <div>
                <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Slug</p>
                <p class="font-mono text-xs break-all" :style="{ color: 'var(--text-muted)' }">{{ product.slug || '—' }}</p>
              </div>
            </div>
            <div v-if="product.short_description">
              <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Short Description</p>
              <p :style="{ color: 'var(--text-primary)' }">{{ product.short_description }}</p>
            </div>
            <div v-if="product.description">
              <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Description</p>
              <div class="prose prose-sm max-w-none rounded-lg p-3"
                :style="{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }"
                v-html="product.description" />
            </div>
          </div>
        </div>

        <!-- Attributes & Variants -->
        <div v-if="product.type === 'variable' && product.attributes?.length" class="card p-5">
          <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Attributes</h3>
          <div class="space-y-3">
            <div v-for="attr in product.attributes" :key="attr.id">
              <p class="text-xs mb-2" :style="{ color: 'var(--text-muted)' }">{{ attr.name }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="val in attr.values" :key="val.id"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  :style="{ background: 'var(--badge-bg, #e8f5e9)', color: 'var(--color-primary)' }">
                  <span v-if="val.color_code" :style="{ background: val.color_code }"
                    class="w-3 h-3 rounded-full inline-block border border-white" />
                  {{ val.value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="product.type === 'variable' && product.variants?.length" class="card p-5">
          <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">
            Variants
            <span class="font-normal text-sm ml-1" :style="{ color: 'var(--text-muted)' }">({{ product.variants.length }})</span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr :style="{ background: 'var(--bg-secondary, #f9fafb)' }">
                  <th class="table-header">Combination</th>
                  <th class="table-header">Price</th>
                  <th class="table-header">Stock</th>
                  <th class="table-header">SKU</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="variant in product.variants" :key="variant.id"
                  class="border-b" :style="{ borderColor: 'var(--border-color)' }">
                  <td class="table-cell text-xs">
                    {{ Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') }}
                  </td>
                  <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">
                    ৳{{ Number(variant.current_price).toLocaleString() }}
                  </td>
                  <td class="table-cell">
                    <span :class="variant.stock_quantity <= 5 ? 'text-red-500 font-bold' : ''">
                      {{ variant.stock_quantity }}
                    </span>
                  </td>
                  <td class="table-cell font-mono text-xs" :style="{ color: 'var(--text-muted)' }">
                    {{ variant.sku || '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-5">
        <!-- Your Pricing Card -->
        <div class="card p-5">
          <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Your Pricing</h3>
          <div class="space-y-3">
            <div class="rounded-xl p-3" :style="{ background: 'var(--bg-success, #e8f5e9)' }">
              <p class="text-xs mb-1" :style="{ color: 'var(--color-primary)' }">Your Price</p>
              <p class="font-bold text-lg" :style="{ color: 'var(--color-primary)' }">
                ৳{{ Number(vendorPricing?.price || product.price).toLocaleString() }}
              </p>
            </div>
            <div v-if="vendorPricing?.sale_price" class="rounded-xl p-3"
              :style="{ background: 'var(--bg-warning, #fff3e0)' }">
              <p class="text-xs mb-1" style="color: #e65100">Sale Price</p>
              <p class="font-bold text-lg" style="color: #e65100">
                ৳{{ Number(vendorPricing.sale_price).toLocaleString() }}
              </p>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Stock</span>
              <span class="font-bold" :style="{
                color: (vendorPricing?.stock_quantity ?? product.stock_quantity) <= 5 ? '#ef4444' : 'var(--text-primary)',
              }">
                {{ vendorPricing?.stock_quantity ?? product.stock_quantity ?? 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Active</span>
              <StatusBadge :value="vendorPricing?.is_active !== false ? 'active' : 'inactive'" />
            </div>
          </div>
          <router-link :to="`/products/${product.id}/edit`" class="btn-primary text-sm mt-4 w-full text-center block">
            Update Pricing
          </router-link>
        </div>

        <!-- Status card -->
        <div class="card p-5">
          <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Product Status</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Publish Status</span>
              <StatusBadge :value="product.status" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Featured</span>
              <span :class="product.is_featured ? 'text-yellow-500' : ''" class="text-lg">
                {{ product.is_featured ? '★' : '☆' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Reviews</span>
              <span class="font-bold" :style="{ color: 'var(--text-primary)' }">
                {{ product.total_reviews || 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Total Sold</span>
              <span class="font-bold" :style="{ color: 'var(--text-primary)' }">
                {{ product.total_sold || 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Category -->
        <div v-if="product.category" class="card p-5">
          <h3 class="font-bold mb-3" :style="{ color: 'var(--text-primary)' }">Category</h3>
          <StatusBadge :value="product.category.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { productApi } from '@/api'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const activeImage = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Products', to: '/products', icon: ShoppingBagIcon },
  { label: product.value?.name || `Product #${route.params.id}` },
])

const vendorPricing = computed(() => product.value?.vendor_pricing || null)

const allImages = computed(() => {
  const imgs = []
  if (product.value?.thumbnail_url) {
    imgs.push({ url: product.value.thumbnail_url, isPrimary: true })
  }
  if (product.value?.images?.length) {
    for (const img of product.value.images) {
      const url = img.url || (img.image_path ? `/storage/${img.image_path}` : null)
      if (url && !imgs.find(i => i.url === url)) {
        imgs.push({ url, isPrimary: img.is_primary || false })
      }
    }
  }
  return imgs
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await productApi.show(route.params.id)
    product.value = res.data.data
    activeImage.value = allImages.value[0]?.url || null
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to load product.'
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
