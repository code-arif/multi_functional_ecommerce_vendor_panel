<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }">
          <ArchiveBoxIcon class="w-5 h-5" :style="{ color: 'var(--color-primary)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Total Products</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ summary.product_count || 0 }}</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }">
          <CheckCircleIcon class="w-5 h-5" :style="{ color: 'var(--success)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">In Stock</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ summary.in_stock_count || 0 }}</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }">
          <ExclamationTriangleIcon class="w-5 h-5" :style="{ color: 'var(--warning)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Low Stock</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ summary.low_stock_count || 0 }}</p>
        </div>
      </div>

      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--danger) 15%, transparent)' }">
          <XCircleIcon class="w-5 h-5" :style="{ color: 'var(--danger)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Out of Stock</p>
          <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ summary.out_of_stock_count || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Stock Adjust Modal -->
    <transition name="fade">
      <div v-if="showAdjustModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        :style="{ backgroundColor: 'rgba(0,0,0,0.5)' }" @click.self="showAdjustModal = false">
        <div class="w-full max-w-md rounded-xl shadow-lg border p-6"
          :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }">
          <h3 class="font-bold text-lg mb-1" :style="{ color: 'var(--text-primary)' }">Adjust Stock</h3>
          <p class="text-sm mb-4" :style="{ color: 'var(--text-muted)' }">
            {{ adjustProduct?.product?.name || adjustProduct?.name }}
          </p>
          <div class="space-y-4">
            <div>
              <label class="label">Current Stock</label>
              <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">
                {{ adjustProduct?.stock_quantity || adjustProduct?.stock || 0 }}
              </p>
            </div>
            <div>
              <label class="label">Adjustment Quantity</label>
              <input v-model.number="adjustQuantity" type="number" class="input" placeholder="e.g. +10 or -5" />
              <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
                Use positive values to add stock, negative to reduce
              </p>
            </div>
            <div>
              <label class="label">Reason / Notes</label>
              <textarea v-model="adjustNote" rows="2" class="input" placeholder="e.g. Restock from supplier"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showAdjustModal = false"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :style="{ color: 'var(--text-secondary)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Cancel
            </button>
            <button @click="confirmAdjust" :disabled="!adjustQuantity"
              class="btn-primary">
              Confirm Adjustment
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Data Table -->
    <div class="w-full overflow-x-auto">
      <DataTable
        :items="items"
        :columns="columns"
        :loading="loading"
        searchable
        :pagination="pagination"
        search-placeholder="Search products..."
        empty-text="No inventory items found"
        @search="q => { search = q; load(1) }"
        @page="load"
      >
        <template #actions>
          <button @click="load()"
            class="px-3 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            :style="{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
            title="Refresh">
            <ArrowPathIcon class="w-4 h-4" />
          </button>
          <router-link to="/inventory/logs" class="btn-secondary text-xs py-1.5 px-3">
            Stock History
          </router-link>
        </template>

        <template #filters>
          <SelectBox v-model="stockStatusFilter" :options="stockStatusOptions" placeholder="All Stock" size="md" @change="load(1)" />
        </template>

        <template #default="{ item }">
          <td class="table-cell">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" :style="{ background: 'var(--border-light)' }">
                <img v-if="item.product?.thumbnail_url" :src="item.product.thumbnail_url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <ArchiveBoxIcon class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
                </div>
              </div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
                  {{ item.product?.name || item.name || 'Product' }}
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ item.product?.sku || item.sku || 'No SKU' }}</p>
              </div>
            </div>
          </td>

          <td class="table-cell">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              ৳{{ Number(item.price || item.sale_price || 0).toLocaleString() }}
            </p>
          </td>

          <td class="table-cell">
            <span class="font-bold text-sm" :style="{
              color: (item.stock_quantity || item.stock || 0) <= 0 ? 'var(--danger)' :
                     (item.stock_quantity || item.stock || 0) <= 5 ? 'var(--warning)' :
                     'var(--success)'
            }">
              {{ item.stock_quantity || item.stock || 0 }}
            </span>
          </td>

          <td class="table-cell">
            <StatusBadge :value="stockStatusLabel(item)" />
          </td>

          <td class="table-cell text-right">
            <div class="flex items-center justify-end gap-1">
              <Tooltip text="Adjust Stock">
                <button @click="openAdjust(item)"
                  class="p-1.5 rounded-lg transition-all inline-flex items-center"
                  :style="{ border: '1px solid var(--border)', color: 'var(--text-muted)' }"
                  @mouseenter="e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-primary)' }"
                  @mouseleave="e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }">
                  <AdjustmentsHorizontalIcon class="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </td>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { inventoryApi } from '@/api'

import {
  ArrowPathIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

const items = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')
const stockStatusFilter = ref('')

const summary = reactive({
  product_count: 0,
  in_stock_count: 0,
  low_stock_count: 0,
  out_of_stock_count: 0,
})

const breadcrumbItems = computed(() => [
  { label: 'Inventory', icon: ArchiveBoxIcon }
])

const stockStatusOptions = [
  { value: '', label: 'All Stock' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

const columns = [
  { key: 'product', label: 'Product', class: 'min-w-[200px]' },
  { key: 'price', label: 'Price', class: 'min-w-[100px]' },
  { key: 'stock', label: 'Stock', class: 'min-w-[80px]' },
  { key: 'status', label: 'Status', class: 'min-w-[120px]' },
  { key: 'actions', label: 'Action', class: 'w-20 text-right' },
]

function stockStatusLabel(item) {
  const qty = item.stock_quantity || item.stock || 0
  if (qty <= 0) return 'Out of Stock'
  if (qty <= item.low_stock_threshold || qty <= 5) return 'Low Stock'
  return 'In Stock'
}

/* ─── Stock Adjust Modal ─── */
const showAdjustModal = ref(false)
const adjustProduct = ref(null)
const adjustQuantity = ref(0)
const adjustNote = ref('')

function openAdjust(item) {
  adjustProduct.value = item
  adjustQuantity.value = 0
  adjustNote.value = ''
  showAdjustModal.value = true
}

async function confirmAdjust() {
  if (!adjustQuantity.value || !adjustProduct.value) return
  try {
    await inventoryApi.adjust({
      vendor_product_id: adjustProduct.value.id,
      quantity: adjustQuantity.value,
      notes: adjustNote.value,
    })
    toast.success('Stock adjusted successfully.')
    showAdjustModal.value = false
    load(pagination.value?.current_page || 1)
    loadSummary()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to adjust stock.')
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await inventoryApi.list({
      page,
      search: search.value || undefined,
      stock_status: stockStatusFilter.value || undefined,
      per_page: 20
    })
    items.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    const res = await inventoryApi.summary()
    const data = res.data.data || res.data
    Object.assign(summary, {
      product_count: data.product_count || data.total_products || 0,
      in_stock_count: data.in_stock_count || 0,
      low_stock_count: data.low_stock_count || 0,
      out_of_stock_count: data.out_of_stock_count || 0,
    })
  } catch {}
}

onMounted(() => {
  load()
  loadSummary()
})
</script>
