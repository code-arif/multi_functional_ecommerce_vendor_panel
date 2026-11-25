<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Accounts List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-center gap-3">
              <BanknotesIcon class="w-5 h-5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Payout Accounts</h2>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Manage bank accounts and mobile wallets used for order settlement payouts
                </p>
              </div>
            </div>
            <button @click="openCreateForm" class="btn-primary text-xs py-2 px-3">
              <PlusIcon class="w-4 h-4" />
              Add Account
            </button>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            Loading payout accounts...
          </div>

          <div v-else-if="accounts.length === 0" class="p-10 text-center">
            <BanknotesIcon class="w-10 h-10 mx-auto mb-3 opacity-50" :style="{ color: 'var(--text-muted)' }" />
            <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">No payout accounts configured</p>
            <p class="text-xs mt-1 mb-4" :style="{ color: 'var(--text-muted)' }">
              Add a Bangladesh bank account or bKash/Nagad/Rocket wallet to receive payouts.
            </p>
            <button @click="openCreateForm" class="btn-primary text-xs">
              <PlusIcon class="w-4 h-4" />
              Add First Payout Account
            </button>
          </div>

          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="acc in accounts" :key="acc.uuid" class="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div class="space-y-1.5 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                    {{ acc.bank_name || acc.mobile_banking_provider || 'Payout Account' }}
                  </span>
                  <span v-if="acc.is_default"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }">
                    <CheckCircleIcon class="w-3.5 h-3.5" />
                    Default
                  </span>
                </div>

                <div v-if="acc.account_number" class="text-xs space-y-0.5" :style="{ color: 'var(--text-secondary)' }">
                  <p>
                    <span :style="{ color: 'var(--text-muted)' }">A/C Holder:</span>
                    {{ acc.account_name || '—' }} ·
                    <span :style="{ color: 'var(--text-muted)' }">A/C No:</span>
                    <strong class="font-mono">{{ acc.account_number }}</strong>
                  </p>
                  <p v-if="acc.branch_name || acc.routing_number || acc.swift_code" :style="{ color: 'var(--text-muted)' }">
                    <span v-if="acc.branch_name">Branch: {{ acc.branch_name }}</span>
                    <span v-if="acc.routing_number"> · Routing: {{ acc.routing_number }}</span>
                    <span v-if="acc.swift_code"> · SWIFT: {{ acc.swift_code }}</span>
                  </p>
                </div>

                <p v-if="acc.mobile_banking_number" class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                  <span :style="{ color: 'var(--text-muted)' }">Mobile Wallet:</span>
                  <span class="font-semibold uppercase">{{ acc.mobile_banking_provider || 'MFS' }}</span> —
                  <span class="font-mono">{{ acc.mobile_banking_number }}</span>
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button v-if="!acc.is_default" @click="setDefault(acc)" :disabled="busyUuid === acc.uuid"
                  class="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                  :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }">
                  Set Default
                </button>
                <button @click="editAccount(acc)"
                  class="p-1.5 rounded-lg transition"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="Edit">
                  <PencilSquareIcon class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(acc)"
                  class="p-1.5 rounded-lg transition"
                  :style="{ color: 'var(--danger)' }"
                  title="Delete">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create / Edit Form -->
      <div v-if="showForm" class="card p-5 h-fit">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
            {{ editingUuid ? 'Edit Payout Account' : 'Add Payout Account' }}
          </h3>
          <button @click="closeForm" class="text-xs" :style="{ color: 'var(--text-muted)' }">Close</button>
        </div>

        <form @submit.prevent="saveAccount" class="space-y-4">
          <div>
            <label class="label">Payout Method</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" @click="payoutMode = 'bank'"
                class="py-2 px-3 rounded-lg text-xs font-semibold border transition"
                :style="payoutMode === 'bank'
                  ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }">
                Bank Account
              </button>
              <button type="button" @click="payoutMode = 'mobile'"
                class="py-2 px-3 rounded-lg text-xs font-semibold border transition"
                :style="payoutMode === 'mobile'
                  ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }">
                Mobile Banking
              </button>
            </div>
          </div>

          <template v-if="payoutMode === 'bank'">
            <div>
              <label class="label">Bank Name</label>
              <input v-model="form.bank_name" type="text" class="input" placeholder="e.g. Dutch-Bangla Bank, BRAC Bank" />
            </div>
            <div>
              <label class="label">Account Holder Name</label>
              <input v-model="form.account_name" type="text" class="input" placeholder="Full name as on bank account" />
            </div>
            <div>
              <label class="label">Account Number <span class="text-red-500">*</span></label>
              <input v-model="form.account_number" type="text" required class="input font-mono" placeholder="Bank account number" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Branch Name</label>
                <input v-model="form.branch_name" type="text" class="input" placeholder="Branch" />
              </div>
              <div>
                <label class="label">Routing Number</label>
                <input v-model="form.routing_number" type="text" class="input" placeholder="9-digit routing" />
              </div>
            </div>
            <div>
              <label class="label">SWIFT / BIC Code</label>
              <input v-model="form.swift_code" type="text" class="input" placeholder="Optional SWIFT code" />
            </div>
          </template>

          <template v-else>
            <div>
              <label class="label">Provider <span class="text-red-500">*</span></label>
              <SelectBox
                v-model="form.mobile_banking_provider"
                :options="mobileProviderOptions"
                placeholder="Select provider..."
                fullWidth
              />
            </div>
            <div>
              <label class="label">Account Holder Name</label>
              <input v-model="form.account_name" type="text" class="input" placeholder="Registered owner name" />
            </div>
            <div>
              <label class="label">Wallet / Mobile Number <span class="text-red-500">*</span></label>
              <input v-model="form.mobile_banking_number" type="tel" required class="input font-mono" placeholder="01XXXXXXXXX" />
            </div>
          </template>

          <label class="flex items-center gap-2 cursor-pointer text-xs pt-1" :style="{ color: 'var(--text-secondary)' }">
            <input v-model="form.is_default" type="checkbox" class="rounded" />
            Set as default payout account
          </label>

          <div class="flex gap-2 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
              {{ saving ? 'Saving...' : (editingUuid ? 'Update Account' : 'Save Account') }}
            </button>
            <button type="button" @click="closeForm" class="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="deleteModal.show"
      :loading="deleteModal.loading"
      title="Delete Payout Account"
      :message="`Remove ${deleteModal.item?.bank_name || deleteModal.item?.mobile_banking_provider || 'this payout account'}?`"
      confirmText="Delete"
      @confirm="executeDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { bankAccountApi } from '@/api'
import {
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const busyUuid = ref(null)
const accounts = ref([])
const showForm = ref(false)
const editingUuid = ref(null)
const payoutMode = ref('bank')

const mobileProviderOptions = [
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'upay', label: 'Upay' },
]

const deleteModal = reactive({
  show: false,
  loading: false,
  item: null,
})

const form = reactive({
  bank_name: '',
  branch_name: '',
  account_name: '',
  account_number: '',
  routing_number: '',
  swift_code: '',
  mobile_banking_provider: '',
  mobile_banking_number: '',
  is_default: false,
})

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
  { label: 'Payout Accounts', icon: null },
])

function resetForm() {
  form.bank_name = ''
  form.branch_name = ''
  form.account_name = ''
  form.account_number = ''
  form.routing_number = ''
  form.swift_code = ''
  form.mobile_banking_provider = ''
  form.mobile_banking_number = ''
  form.is_default = accounts.value.length === 0
}

function openCreateForm() {
  editingUuid.value = null
  payoutMode.value = 'bank'
  resetForm()
  showForm.value = true
}

function editAccount(acc) {
  editingUuid.value = acc.uuid
  payoutMode.value = acc.account_number ? 'bank' : 'mobile'
  form.bank_name = acc.bank_name || ''
  form.branch_name = acc.branch_name || ''
  form.account_name = acc.account_name || ''
  form.account_number = acc.account_number || ''
  form.routing_number = acc.routing_number || ''
  form.swift_code = acc.swift_code || ''
  form.mobile_banking_provider = acc.mobile_banking_provider || ''
  form.mobile_banking_number = acc.mobile_banking_number || ''
  form.is_default = !!acc.is_default
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingUuid.value = null
}

async function loadAccounts() {
  loading.value = true
  try {
    const res = await bankAccountApi.list()
    accounts.value = res.data?.data || []
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load payout accounts.')
  } finally {
    loading.value = false
  }
}

async function saveAccount() {
  if (payoutMode.value === 'mobile' && !form.mobile_banking_provider) {
    toast.error('Please select a mobile banking provider.')
    return
  }
  saving.value = true
  try {
    const payload = {
      account_name: form.account_name || null,
      is_default: form.is_default,
      ...(payoutMode.value === 'bank'
        ? {
            bank_name: form.bank_name || null,
            branch_name: form.branch_name || null,
            account_number: form.account_number || null,
            routing_number: form.routing_number || null,
            swift_code: form.swift_code || null,
            mobile_banking_provider: null,
            mobile_banking_number: null,
          }
        : {
            bank_name: null,
            branch_name: null,
            account_number: null,
            routing_number: null,
            swift_code: null,
            mobile_banking_provider: form.mobile_banking_provider || null,
            mobile_banking_number: form.mobile_banking_number || null,
          }),
    }

    if (editingUuid.value) {
      await bankAccountApi.update(editingUuid.value, payload)
      toast.success('Payout account updated.')
    } else {
      await bankAccountApi.store(payload)
      toast.success('Payout account added.')
    }
    closeForm()
    await loadAccounts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to save payout account.')
  } finally {
    saving.value = false
  }
}

async function setDefault(acc) {
  busyUuid.value = acc.uuid
  try {
    await bankAccountApi.setDefault(acc.uuid)
    toast.success('Default payout account updated.')
    await loadAccounts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update default account.')
  } finally {
    busyUuid.value = null
  }
}

function confirmDelete(acc) {
  deleteModal.item = acc
  deleteModal.show = true
}

async function executeDelete() {
  if (!deleteModal.item) return
  deleteModal.loading = true
  try {
    await bankAccountApi.destroy(deleteModal.item.uuid)
    toast.success('Payout account removed.')
    deleteModal.show = false
    deleteModal.item = null
    await loadAccounts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete payout account.')
  } finally {
    deleteModal.loading = false
  }
}

onMounted(loadAccounts)
</script>
