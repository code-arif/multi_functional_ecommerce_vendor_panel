<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="w-full overflow-x-auto">
      <DataTable
        :items="transactions"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        empty-text="No transactions found"
        @page="load"
      >
        <template #filters>
          <SelectBox v-model="typeFilter" :options="typeOptions" placeholder="All Types" size="md" @change="load(1)" />
        </template>

        <template #default="{ item }">
          <td class="table-cell">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :style="{
                  backgroundColor: (item.amount || 0) >= 0
                    ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                    : 'color-mix(in srgb, var(--danger) 15%, transparent)'
                }">
                <BanknotesIcon class="w-4 h-4" :style="{
                  color: (item.amount || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
                }" />
              </div>
              <div>
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
                  {{ item.description || item.type || 'Transaction' }}
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(item.created_at) }}</p>
              </div>
            </div>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.type" />
          </td>

          <td class="table-cell text-right">
            <span class="font-bold text-sm" :style="{
              color: (item.amount || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
            }">
              {{ (item.amount || 0) >= 0 ? '+' : '' }}৳{{ formatNumber(Math.abs(item.amount || 0)) }}
            </span>
          </td>

          <td class="table-cell text-right">
            <span class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              ৳{{ formatNumber(item.balance_after || 0) }}
            </span>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.status" />
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
import { financeApi } from '@/api'

import { BanknotesIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { WalletIcon } from '@heroicons/vue/24/outline'

const transactions = ref([])
const pagination = ref(null)
const loading = ref(true)
const typeFilter = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Finance', icon: WalletIcon, to: '/wallet' },
  { label: 'Transactions', icon: null },
])

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'commission', label: 'Commission' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'refund', label: 'Refund' },
  { value: 'adjustment', label: 'Adjustment' },
]

const columns = [
  { key: 'description', label: 'Description', class: 'min-w-[250px]' },
  { key: 'type', label: 'Type', class: 'min-w-[100px]' },
  { key: 'amount', label: 'Amount', class: 'min-w-[130px] text-right' },
  { key: 'balance', label: 'Balance', class: 'min-w-[130px] text-right' },
  { key: 'status', label: 'Status', class: 'min-w-[100px]' },
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
    const res = await financeApi.transactions({
      page,
      type: typeFilter.value || undefined,
      per_page: 20
    })
    transactions.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
