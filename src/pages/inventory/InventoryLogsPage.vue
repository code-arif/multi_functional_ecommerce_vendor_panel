<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="w-full overflow-x-auto">
      <DataTable
        :items="logs"
        :columns="columns"
        :loading="loading"
        searchable
        :pagination="pagination"
        search-placeholder="Search by product..."
        empty-text="No stock adjustments found"
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
          <router-link to="/inventory" class="btn-secondary text-xs py-1.5 px-3">
            Back to Stock
          </router-link>
        </template>

        <template #filters>
          <SelectBox v-model="typeFilter" :options="typeOptions" placeholder="All Types" size="md" @change="load(1)" />
        </template>

        <template #default="{ item }">
          <td class="table-cell">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              {{ item.product?.name || item.product_name || 'Product' }}
            </p>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.type" />
          </td>

          <td class="table-cell">
            <span class="font-bold text-sm" :style="{
              color: (item.quantity || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
            }">
              {{ (item.quantity || 0) >= 0 ? '+' : '' }}{{ item.quantity }}
            </span>
          </td>

          <td class="table-cell">
            <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ item.balance_before || item.stock_before || 0 }}</span>
            <ArrowRightIcon class="w-3 h-3 inline mx-1" :style="{ color: 'var(--text-muted)' }" />
            <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ item.balance_after || item.stock_after || 0 }}</span>
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ item.notes || item.reason || '—' }}
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ item.created_by?.name || item.created_by_name || 'System' }}
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ formatDate(item.created_at) }}
          </td>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { inventoryApi } from '@/api'

import { ArrowPathIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { ArchiveBoxIcon } from '@heroicons/vue/24/outline'

const logs = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')
const typeFilter = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Inventory', icon: ArchiveBoxIcon, to: '/inventory' },
  { label: 'Stock History', icon: null },
])

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'return', label: 'Return' },
  { value: 'transfer', label: 'Transfer' },
]

const columns = [
  { key: 'product', label: 'Product', class: 'min-w-[180px]' },
  { key: 'type', label: 'Type', class: 'min-w-[100px]' },
  { key: 'quantity', label: 'Qty Change', class: 'min-w-[80px]' },
  { key: 'balance', label: 'Balance', class: 'min-w-[120px]' },
  { key: 'notes', label: 'Notes', class: 'min-w-[200px]' },
  { key: 'by', label: 'By', class: 'min-w-[130px]' },
  { key: 'date', label: 'Date', class: 'min-w-[150px]' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await inventoryApi.logs({
      page,
      search: search.value || undefined,
      type: typeFilter.value || undefined,
      per_page: 20
    })
    logs.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
