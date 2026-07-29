<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <DataTable
      :items="products"
      :columns="columns"
      :loading="loading"
      searchable
      :pagination="pagination"
      search-placeholder="Search products..."
      empty-icon="📦"
      empty-text="No products found"
      @search="q => { search = q; load(1) }"
      @page="load"
    >
      <template #filters>
        <SelectBox
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Status"
          size="md"
          @change="load(1)"
        />
      </template>
      <template #actions>
        <button @click="exportProducts"
          class="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-opacity-80 transition-colors inline-flex items-center gap-1.5"
          :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }"
          title="Export CSV">
          <ArrowDownTrayIcon class="w-4 h-4" />
          Export
        </button>
        <button @click="load()"
          class="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-opacity-80 transition-colors inline-flex items-center gap-1.5"
          :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }"
          title="Refresh">
          <ArrowPathIcon class="w-4 h-4" />
        </button>
        <router-link to="/products/create" class="btn-primary">
          Add Product
        </router-link>
      </template>

      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" :style="{ background: 'var(--border-light)' }">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-lg">
                <ShoppingBagIcon class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
              </div>
            </div>
            <div>
              <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">{{ item.name }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ item.sku || 'No SKU' }}</p>
            </div>
          </div>
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.type" />
        </td>

        <td class="table-cell">
          <template v-if="item.vendor_price">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              ৳{{ Number(item.vendor_price.price || item.vendor_price.sale_price || 0).toLocaleString() }}
            </p>
            <p v-if="item.vendor_price.sale_price" class="text-xs line-through" :style="{ color: 'var(--text-muted)' }">
              ৳{{ Number(item.vendor_price.price).toLocaleString() }}
            </p>
          </template>
          <template v-else>
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              ৳{{ Number(item.current_price).toLocaleString() }}
            </p>
          </template>
        </td>

        <td class="table-cell">
          <span class="text-sm" :style="{ color: 'var(--text-primary)' }">
            {{ item.vendor_price?.stock_quantity ?? item.stock_quantity ?? 0 }}
          </span>
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>

        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1">
            <Tooltip text="View">
              <router-link :to="`/products/${item.id}`"
                class="p-1.5 rounded-lg border hover:border-gray-400 transition-all"
                :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }">
                <EyeIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <router-link :to="`/products/${item.id}/edit`"
                class="p-1.5 rounded-lg border hover:border-blue-400 transition-all"
                :style="{ borderColor: 'var(--border-color)', color: 'var(--color-primary)' }">
                <PencilIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Remove">
              <button @click="confirmDelete(item)"
                class="p-1.5 rounded-lg border hover:border-red-400 transition-all"
                :style="{ borderColor: 'var(--border-color)', color: 'var(--color-danger, #ef4444)' }">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <ConfirmModal
      :show="!!deleteTarget"
      title="Remove Product"
      :message="`Remove '${deleteTarget?.name}' from your shop? It can be re-added later.`"
      :loading="deleting"
      confirm-text="Remove"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { productApi } from '@/api'
import {
  ShoppingBagIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import { useCsvExport } from '@ecom/ui/composables/useCsvExport'

const toast = useToast()
const { exportToCsv } = useCsvExport()

const products = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const deleteTarget = ref(null)
const deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Products', icon: ShoppingBagIcon }
])

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
]

const columns = [
  { key: 'name', label: 'Product', class: 'w-64' },
  { key: 'type', label: 'Type', class: 'w-24' },
  { key: 'price', label: 'Price', class: 'w-28' },
  { key: 'stock', label: 'Stock', class: 'w-20' },
  { key: 'status', label: 'Status', class: 'w-24' },
  { key: 'actions', label: 'Action', class: 'w-28 text-right' },
]

async function load(page = 1) {
  loading.value = true
  try {
    const res = await productApi.list({
      page,
      search: search.value,
      status: statusFilter.value || undefined,
      per_page: 20,
    })
    products.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load products.')
  } finally {
    loading.value = false
  }
}

function exportProducts() {
  const cols = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'type', label: 'Type' },
    { key: 'vendor_price', label: 'Price (৳)', transform: (v) => `৳${Number(v?.price || v?.sale_price || 0).toLocaleString()}` },
    { key: 'vendor_price', label: 'Stock', transform: (v) => v?.stock_quantity ?? 0 },
    { key: 'status', label: 'Status' },
  ]
  exportToCsv(products.value, cols, `products-export-${products.value.length}-items`)
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await productApi.destroy(deleteTarget.value.id)
    toast.success('Product removed from your shop.')
    deleteTarget.value = null
    load()
  } catch {
    toast.error('Failed to remove product.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>
