<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="w-full overflow-x-auto">
      <DataTable
        :items="payouts"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        empty-text="No payout requests found"
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
            <p class="font-bold" :style="{ color: 'var(--color-primary)' }">
              ৳{{ formatNumber(item.amount) }}
            </p>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.status" />
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ item.payment_method || (item.payment_details?.method || '—') }}
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ formatDate(item.created_at) }}
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ item.notes || '—' }}
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
import { financeApi } from '@/api'

import { ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { WalletIcon } from '@heroicons/vue/24/outline'

const payouts = ref([])
const pagination = ref(null)
const loading = ref(true)

const breadcrumbItems = computed(() => [
  { label: 'Finance', icon: WalletIcon, to: '/wallet' },
  { label: 'Payouts', icon: null },
])

const columns = [
  { key: 'amount', label: 'Amount', class: 'min-w-[120px]' },
  { key: 'status', label: 'Status', class: 'min-w-[120px]' },
  { key: 'method', label: 'Method', class: 'min-w-[130px]' },
  { key: 'date', label: 'Date', class: 'min-w-[150px]' },
  { key: 'notes', label: 'Notes', class: 'min-w-[200px]' },
]

function formatNumber(val) {
  return Number(val || 0).toLocaleString()
}

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
    const res = await financeApi.payouts({ page, per_page: 20 })
    payouts.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
