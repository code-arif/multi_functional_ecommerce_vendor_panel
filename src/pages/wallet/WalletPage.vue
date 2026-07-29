<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Wallet Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card p-5" :style="{ borderLeft: '4px solid var(--color-primary)' }">
        <p class="text-xs font-semibold uppercase tracking-wide mb-1" :style="{ color: 'var(--text-muted)' }">Current Balance</p>
        <p class="text-3xl font-black" :style="{ color: 'var(--color-primary)' }">৳{{ formatNumber(wallet.current_balance) }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">Available for withdrawal</p>
      </div>

      <div class="card p-5" :style="{ borderLeft: '4px solid var(--success)' }">
        <p class="text-xs font-semibold uppercase tracking-wide mb-1" :style="{ color: 'var(--text-muted)' }">Total Earned</p>
        <p class="text-3xl font-black" :style="{ color: 'var(--success)' }">৳{{ formatNumber(wallet.total_earned) }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">{{ formatNumber(wallet.monthly_earnings) }} earned this month</p>
      </div>

      <div class="card p-5" :style="{ borderLeft: '4px solid var(--info)' }">
        <p class="text-xs font-semibold uppercase tracking-wide mb-1" :style="{ color: 'var(--text-muted)' }">Total Withdrawn</p>
        <p class="text-3xl font-black" :style="{ color: 'var(--info)' }">৳{{ formatNumber(wallet.total_withdrawn) }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">Lifetime withdrawals</p>
      </div>
    </div>

    <!-- Pending Payouts Alert -->
    <div v-if="wallet.pending_payouts > 0" class="card p-4 mb-6 flex items-center gap-3"
      :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, var(--surface))', border: '1px solid color-mix(in srgb, var(--warning) 25%, transparent)' }">
      <ExclamationTriangleIcon class="w-5 h-5 shrink-0" :style="{ color: 'var(--warning)' }" />
      <div class="text-sm" :style="{ color: 'var(--text-primary)' }">
        <span class="font-semibold">Pending Payout:</span>
        <span class="ml-1">You have ৳{{ formatNumber(wallet.pending_payouts) }} in pending payout requests.</span>
      </div>
      <router-link to="/wallet/payouts" class="ml-auto text-xs font-semibold" :style="{ color: 'var(--color-primary)' }">
        View Payouts
      </router-link>
    </div>

    <!-- Quick Actions -->
    <div class="card p-5 mb-6">
      <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Quick Actions</h3>
      <div class="flex flex-wrap gap-3">
        <button @click="showPayoutModal = true" :disabled="(wallet.current_balance || 0) < 100"
          class="btn-primary text-sm">
          <BanknotesIcon class="w-4 h-4" />
          Request Payout
        </button>
        <router-link to="/wallet/payouts" class="btn-secondary text-sm">
          <CurrencyDollarIcon class="w-4 h-4" />
          Payout History
        </router-link>
        <router-link to="/wallet/transactions" class="btn-ghost text-sm">
          <ArrowPathIcon class="w-4 h-4" />
          All Transactions
        </router-link>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
        <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Recent Transactions</h3>
        <router-link to="/wallet/transactions" class="text-xs font-semibold" :style="{ color: 'var(--color-primary)' }">
          View All
        </router-link>
      </div>
      <div v-if="loading" class="p-6 text-center text-sm" :style="{ color: 'var(--text-muted)' }">Loading...</div>
      <div v-else-if="transactions.length === 0" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
        <BanknotesIcon class="w-8 h-8 mx-auto mb-2" />
        No transactions yet
      </div>
      <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
        <div v-for="txn in transactions.slice(0, 10)" :key="txn.id" class="flex items-center gap-4 px-5 py-3.5">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :style="{
              backgroundColor: txn.type === 'commission' || txn.type === 'credit'
                ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                : 'color-mix(in srgb, var(--danger) 15%, transparent)'
            }">
            <BanknotesIcon class="w-4 h-4" :style="{
              color: txn.type === 'commission' || txn.type === 'credit' ? 'var(--success)' : 'var(--danger)'
            }" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">
              {{ txn.description || txn.type || 'Transaction' }}
            </p>
            <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(txn.created_at) }}</p>
          </div>
          <span class="font-bold text-sm" :style="{
            color: (txn.amount || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
          }">
            {{ (txn.amount || 0) >= 0 ? '+' : '' }}৳{{ formatNumber(Math.abs(txn.amount || 0)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Payout Request Modal -->
    <transition name="fade">
      <div v-if="showPayoutModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        :style="{ backgroundColor: 'rgba(0,0,0,0.5)' }" @click.self="showPayoutModal = false">
        <div class="w-full max-w-md rounded-xl shadow-lg border p-6"
          :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }">
          <h3 class="font-bold text-lg mb-1" :style="{ color: 'var(--text-primary)' }">Request Payout</h3>
          <p class="text-sm mb-4" :style="{ color: 'var(--text-muted)' }">
            Available balance: <strong>৳{{ formatNumber(wallet.current_balance) }}</strong>
          </p>
          <div class="space-y-4">
            <div>
              <label class="label">Amount (Min ৳100)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-muted)' }">৳</span>
                <input v-model.number="payoutAmount" type="number" min="100" :max="wallet.current_balance" step="0.01"
                  class="input pl-7" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="label">Payment Method</label>
              <SelectBox v-model="payoutMethod" :options="paymentMethodOptions" placeholder="Select payment method..." />
            </div>
            <div>
              <label class="label">Notes (Optional)</label>
              <textarea v-model="payoutNotes" rows="2" class="input" placeholder="Any additional notes..."></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showPayoutModal = false"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :style="{ color: 'var(--text-secondary)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Cancel
            </button>
            <button @click="submitPayout" :disabled="!payoutAmount || payoutAmount < 100"
              class="btn-primary">
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { financeApi } from '@/api'

import {
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

const loading = ref(true)
const wallet = reactive({
  current_balance: 0,
  total_earned: 0,
  total_withdrawn: 0,
  pending_payouts: 0,
  monthly_earnings: 0,
  available: 0,
})
const transactions = ref([])

/* ─── Payout Modal ─── */
const showPayoutModal = ref(false)
const payoutAmount = ref(0)
const payoutMethod = ref('')
const payoutNotes = ref('')

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
]

const breadcrumbItems = computed(() => [
  { label: 'Finance', icon: WalletIcon },
  { label: 'Wallet', icon: null },
])

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

async function submitPayout() {
  if (!payoutAmount.value || payoutAmount.value < 100) return
  try {
    await financeApi.requestPayout({
      amount: payoutAmount.value,
      payment_method: payoutMethod.value || undefined,
      notes: payoutNotes.value || undefined,
    })
    toast.success('Payout request submitted.')
    showPayoutModal.value = false
    payoutAmount.value = 0
    payoutMethod.value = ''
    payoutNotes.value = ''
    loadWallet()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to submit payout request.')
  }
}

async function loadWallet() {
  try {
    const res = await financeApi.wallet()
    const data = res.data.data || res.data
    Object.assign(wallet, {
      current_balance: data.current_balance || data.balance || 0,
      total_earned: data.total_earned || 0,
      total_withdrawn: data.total_withdrawn || 0,
      pending_payouts: data.pending_payouts || 0,
      monthly_earnings: data.monthly_earnings || 0,
      available: data.available || data.current_balance || 0,
    })
  } catch {}
}

async function loadTransactions() {
  try {
    const res = await financeApi.transactions({ per_page: 10 })
    transactions.value = res.data.data || []
  } catch {}
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadWallet(), loadTransactions()])
  loading.value = false
})
</script>
