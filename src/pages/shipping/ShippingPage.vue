<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="w-full overflow-x-auto">
      <DataTable
        :items="shipments"
        :columns="columns"
        :loading="loading"
        searchable
        :pagination="pagination"
        search-placeholder="Order number, tracking..."
        empty-text="No shipments found"
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
        </template>

        <template #default="{ item }">
          <td class="table-cell">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              #{{ item.order_number || item.order?.order_number || '—' }}
            </p>
            <p v-if="item.tracking_number" class="text-xs font-mono" :style="{ color: 'var(--text-muted)' }">
              TRK: {{ item.tracking_number }}
            </p>
          </td>

          <td class="table-cell">
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">{{ item.courier?.name || item.courier_name || '—' }}</p>
          </td>

          <td class="table-cell">
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">
              {{ item.address?.city || item.destination_city || '—' }}
            </p>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.status" />
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ formatDate(item.created_at) }}
          </td>

          <td class="table-cell text-right">
            <div class="flex items-center justify-end gap-1">
              <Tooltip text="View Tracking">
                <router-link :to="`/orders/${item.order_id}`"
                  class="p-1.5 rounded-lg transition-all inline-flex items-center"
                  :style="{ border: '1px solid var(--border)', color: 'var(--text-muted)' }"
                  @mouseenter="e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-primary)' }"
                  @mouseleave="e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }">
                  <EyeIcon class="w-4 h-4" />
                </router-link>
              </Tooltip>
            </div>
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
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { shippingApi } from '@/api'

import { ArrowPathIcon, EyeIcon, TruckIcon } from '@heroicons/vue/24/outline'

const shipments = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Shipping', icon: TruckIcon },
])

const columns = [
  { key: 'order', label: 'Order', class: 'min-w-[150px]' },
  { key: 'courier', label: 'Courier', class: 'min-w-[130px]' },
  { key: 'destination', label: 'Destination', class: 'min-w-[130px]' },
  { key: 'status', label: 'Status', class: 'min-w-[120px]' },
  { key: 'date', label: 'Date', class: 'min-w-[120px]' },
  { key: 'actions', label: 'Action', class: 'w-20 text-right' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await shippingApi.shipments({
      page,
      search: search.value || undefined,
      per_page: 20
    })
    shipments.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
