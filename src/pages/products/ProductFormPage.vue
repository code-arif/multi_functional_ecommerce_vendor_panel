<template>
  <div class="w-full">
    <Breadcrumb :items="breadcrumbItems" />

    <form @submit.prevent="save" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Basic Information</h3>
            <div class="space-y-4">
              <div>
                <label class="label">Product Name *</label>
                <input v-model="form.name" class="input" placeholder="Enter product name" />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Link to Existing Product</label>
                  <SelectBox
                    v-model="form.product_id"
                    :options="existingProductOptions"
                    placeholder="Or create a new product..."
                    full-width
                    @change="onProductSelect"
                  />
                  <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
                    Select an existing product to sell at your price
                  </p>
                </div>
                <div>
                  <label class="label">SKU</label>
                  <input v-model="form.sku" class="input" placeholder="e.g. PROD-001" />
                  <p v-if="errors.sku" class="text-red-500 text-xs mt-1">{{ errors.sku[0] }}</p>
                </div>
              </div>
              <div>
                <label class="label">Short Description</label>
                <textarea v-model="form.short_description" rows="2" class="input"
                  placeholder="Brief product summary..." />
              </div>
              <div>
                <label class="label">Full Description</label>
                <textarea v-model="form.description" rows="4" class="input"
                  placeholder="Detailed product description..." />
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Your Pricing</h3>
            <p class="text-xs mb-4" :style="{ color: 'var(--text-muted)' }">
              Set the price and stock for your shop. These override the default product pricing.
            </p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="label">Your Price *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    :style="{ color: 'var(--text-muted)' }">৳</span>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="input pl-7"
                    placeholder="0.00" />
                </div>
                <p v-if="errors.price" class="text-red-500 text-xs mt-1">{{ errors.price[0] }}</p>
              </div>
              <div>
                <label class="label">Sale Price</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    :style="{ color: 'var(--text-muted)' }">৳</span>
                  <input v-model.number="form.sale_price" type="number" min="0" step="0.01" class="input pl-7"
                    placeholder="0.00" />
                </div>
                <p v-if="errors.sale_price" class="text-red-500 text-xs mt-1">{{ errors.sale_price[0] }}</p>
              </div>
              <div>
                <label class="label">Stock Quantity</label>
                <input v-model.number="form.stock_quantity" type="number" min="0" class="input" />
                <p v-if="errors.stock_quantity" class="text-red-500 text-xs mt-1">{{ errors.stock_quantity[0] }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <ToggleSwitch v-model="form.manage_stock" label="Track stock quantity" />
            </div>
            <div v-if="form.manage_stock" class="mt-3">
              <label class="label">Low Stock Alert At</label>
              <input v-model.number="form.low_stock_threshold" type="number" min="0" class="input w-32" />
            </div>
          </div>

          <!-- SEO -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">SEO</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Meta Title</label>
                <input v-model="form.meta_title" class="input" />
              </div>
              <div>
                <label class="label">Meta Description</label>
                <textarea v-model="form.meta_description" rows="2" class="input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <!-- Status -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Status</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Active in Shop</label>
                <ToggleSwitch v-model="form.is_active" label="Visible to customers" />
              </div>
            </div>
          </div>

          <!-- Organization -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Organization</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Category</label>
                <SelectBox v-model="form.category_uuid" :options="categoryOptions" placeholder="No Category" full-width :disabled="isEdit || !!form.product_id" />
              </div>
              <div>
                <label class="label">Brand</label>
                <SelectBox v-model="form.brand_uuid" :options="brandOptions" placeholder="No Brand" full-width :disabled="isEdit || !!form.product_id" />
              </div>
            </div>
          </div>

          <!-- Thumbnail -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Thumbnail</h3>
            <div v-if="thumbnailPreview || form.thumbnail_url" class="mb-3">
              <img :src="thumbnailPreview || form.thumbnail_url"
                class="w-full aspect-square object-cover rounded-xl"
                :style="{ border: '1px solid var(--border-color)' }" />
            </div>
            <div
              class="border-2 border-dashed rounded-xl p-4 text-center hover:opacity-70 transition cursor-pointer"
              :style="{ borderColor: 'var(--border-color)' }"
              @click="$refs.thumbInput.click()">
              <PhotoIcon class="w-8 h-8 mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
              <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Click to upload thumbnail</p>
              <p class="text-[11px] mt-0.5" :style="{ color: 'var(--text-muted)' }">JPG, PNG, WebP (max 2MB)</p>
            </div>
            <input ref="thumbInput" type="file" accept="image/*" class="hidden" @change="onThumbChange" />
            <p v-if="errors.thumbnail" class="text-red-500 text-xs mt-1">{{ errors.thumbnail[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="btn-primary px-8 py-2.5">
          {{ saving ? 'Saving...' : (isEdit ? 'Update Pricing' : 'Add to Shop') }}
        </button>
        <button type="button" @click="$router.push('/products')"
          class="px-6 py-2.5 rounded-lg border transition"
          :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import { productApi, categoryApi, brandApi } from '@/api'
import { ShoppingBagIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const isEdit = computed(() => !!route.params.id)

const saving = ref(false)
const errors = ref({})
const thumbnailPreview = ref(null)
const thumbnailFile = ref(null)
const categories = ref([])
const brands = ref([])
const existingProducts = ref([])

const breadcrumbItems = computed(() => [
  { label: 'Products', to: '/products', icon: ShoppingBagIcon },
  { label: isEdit.value ? 'Edit Product Pricing' : 'Add Product' }
])

const categoryOptions = computed(() => [
  { value: null, label: 'No Category' },
  ...categories.value.map(c => ({ value: c.uuid, label: c.name }))
])

const brandOptions = computed(() => [
  { value: null, label: 'No Brand' },
  ...brands.value.map(b => ({ value: b.uuid, label: b.name }))
])

const existingProductOptions = computed(() => [
  { value: null, label: 'Create a new product...' },
  ...existingProducts.value.map(p => ({ value: p.id, label: `${p.name} (${p.sku || 'no SKU'})` }))
])

const form = reactive({
  product_id: null,
  name: '',
  sku: '',
  price: null,
  sale_price: null,
  stock_quantity: 0,
  low_stock_threshold: 5,
  manage_stock: true,
  is_active: true,
  short_description: '',
  description: '',
  category_uuid: null,
  brand_uuid: null,
  meta_title: '',
  meta_description: '',
  thumbnail_url: '',
})

function onThumbChange(e) {
  const f = e.target.files[0]
  if (!f) return
  thumbnailFile.value = f
  thumbnailPreview.value = URL.createObjectURL(f)
}

function onProductSelect(productId) {
  if (!productId) return
  const product = existingProducts.value.find(p => p.id === productId)
  if (product) {
    form.name = product.name
    form.sku = product.sku || ''
    form.short_description = product.short_description || ''
    form.description = product.description || ''
    form.thumbnail_url = product.thumbnail_url || ''
    form.category_uuid = product.category_uuid || null
    form.brand_uuid = product.brand_uuid || null
    form.price = form.price || product.price
  }
}

async function save() {
  saving.value = true
  errors.value = {}

  try {
    const fd = new FormData()

    // If linking to existing product, send product_id instead of name
    if (form.product_id) {
      fd.append('product_id', form.product_id)
    } else {
      fd.append('name', form.name)
      fd.append('sku', form.sku || '')
      fd.append('short_description', form.short_description || '')
      fd.append('description', form.description || '')
      if (form.category_uuid) fd.append('category_uuid', form.category_uuid)
      if (form.brand_uuid) fd.append('brand_uuid', form.brand_uuid)
      fd.append('meta_title', form.meta_title || '')
      fd.append('meta_description', form.meta_description || '')
    }

    // Always send pricing fields
    fd.append('price', form.price ?? '')
    fd.append('sale_price', form.sale_price || '')
    fd.append('stock_quantity', form.stock_quantity ?? 0)
    fd.append('low_stock_threshold', form.low_stock_threshold ?? 5)
    fd.append('manage_stock', form.manage_stock ? '1' : '0')
    fd.append('is_active', form.is_active ? '1' : '0')

    // Thumbnail
    if (thumbnailFile.value) {
      fd.append('thumbnail', thumbnailFile.value)
    }

    if (isEdit.value) {
      // For edit, we only update vendor pricing — use POST with _method=PUT
      await productApi.update(route.params.id, fd)
      toast.success('Product pricing updated.')
    } else {
      await productApi.store(fd)
      toast.success('Product added to your shop.')
    }

    router.push('/products')

  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors || {}
      const firstError = Object.values(errors.value)[0]?.[0]
      toast.error(firstError || 'Validation failed.')
    } else if (e.response?.status === 403) {
      toast.error('Permission denied.')
    } else if (!e.response) {
      toast.error('Network error. Check your connection.')
    } else {
      toast.error(e.response.data?.message || 'Something went wrong.')
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Load catalog categories, brands, and available products for linking
  const [catResult, brandResult, prodResult] = await Promise.allSettled([
    categoryApi.list({ per_page: 200, is_active: true }),
    brandApi.list({ per_page: 200, is_active: true }),
    productApi.list({ per_page: 200 }),
  ])

  if (catResult.status === 'fulfilled') {
    categories.value = catResult.value.data.data || []
  }

  if (brandResult.status === 'fulfilled') {
    brands.value = brandResult.value.data.data || []
  }

  if (prodResult.status === 'fulfilled') {
    // Store existing products for the "link to existing" dropdown
    existingProducts.value = (prodResult.value.data.data || []).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.vendor_price?.price || p.price,
      thumbnail_url: p.thumbnail_url,
      short_description: p.short_description,
      description: p.description,
      category_uuid: p.category?.uuid || null,
      brand_uuid: p.brand?.uuid || null,
    }))
  }

  // Load existing product data for edit mode
  if (isEdit.value) {
    try {
      const res = await productApi.show(route.params.id)
      const p = res.data.data

      form.price = p.vendor_pricing?.price ?? p.price ?? null
      form.sale_price = p.vendor_pricing?.sale_price ?? p.sale_price ?? null
      form.stock_quantity = p.vendor_pricing?.stock_quantity ?? p.stock_quantity ?? 0
      form.low_stock_threshold = p.vendor_pricing?.low_stock_threshold ?? p.low_stock_threshold ?? 5
      form.manage_stock = p.vendor_pricing?.manage_stock ?? p.manage_stock ?? true
      form.is_active = p.vendor_pricing?.is_active ?? true
      form.thumbnail_url = p.thumbnail_url || ''
      form.name = p.name || ''
      form.sku = p.sku || ''
      form.short_description = p.short_description || ''
      form.description = p.description || ''
      form.category_uuid = p.category?.uuid || null
      form.brand_uuid = p.brand?.uuid || null
      form.meta_title = p.meta_title || ''
      form.meta_description = p.meta_description || ''

    } catch {
      toast.error('Failed to load product data.')
    }
  }
})

onUnmounted(() => {
  if (thumbnailPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(thumbnailPreview.value)
  }
})
</script>
